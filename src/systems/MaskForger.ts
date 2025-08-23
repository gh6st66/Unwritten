/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { Mask, WorldSeed, Lexeme, MaskSpec, Mark, ThemeOfFate, TesterMask } from "../game/types";

const TEXT_MODEL = "gemini-2.5-flash";
const IMAGE_MODEL = "imagen-3.0-generate-002";

export class MaskForger {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  public async forgeFirstMask(lexeme: Lexeme, seed: WorldSeed): Promise<Mask> {
    const textDetails = await this.generateFirstMaskText(lexeme, seed);
    const imageUrl = await this.generateFirstMaskImage(textDetails.description, lexeme);

    return {
      id: crypto.randomUUID(),
      ...textDetails,
      imageUrl,
    };
  }

  public async forgeFromSpec(spec: MaskSpec, generateImage: boolean = false): Promise<TesterMask> {
    const textPrompt = this._buildTextPrompt(spec);
    const imagePrompt = this._buildImagePrompt(spec);

    let parsed: { name: string; description: string; grantedMarks: Mark[] };
    let textError: string | undefined;

    try {
      const res = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: textPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "1-3 word evocative name." },
              description: { type: Type.STRING, description: "2-3 sentence somber, mystical description." },
              grantedMarks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "A machine-readable id, e.g. 'iron-will'." },
                    label: { type: Type.STRING, description: "A human-readable label, e.g. 'Iron Will'." },
                    value: { type: Type.INTEGER, description: "The numeric value, always 1." },
                  },
                   propertyOrdering: ["id", "label", "value"],
                },
              },
            },
             propertyOrdering: ["name", "description", "grantedMarks"],
          },
        },
      });
      const txt = res.text.trim();
      parsed = JSON.parse(txt);
    } catch (e) {
      console.error("Gemini call or JSON parsing failed in forgeFromSpec:", e);
      textError = e instanceof Error ? e.message : "An unknown error occurred during text generation.";
      parsed = {
        name: this._titleFrom(spec),
        description: this._fallbackDescription(spec),
        grantedMarks: this._defaultMarks(spec),
      };
    }

    const theme = this._fateFromWord(spec);
    let imageUrl: string | undefined = undefined;
    let imageError: string | undefined;
    
    if (generateImage) {
        try {
            const res = await this.ai.models.generateImages({
                model: IMAGE_MODEL,
                prompt: imagePrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });
        
            if (res.generatedImages && res.generatedImages.length > 0) {
                imageUrl = `data:image/jpeg;base64,${res.generatedImages[0].image.imageBytes}`;
            }
        } catch(e) {
            console.error("Image generation failed in forgeFromSpec:", e);
            imageError = e instanceof Error ? e.message : "An unknown error occurred during image generation.";
            imageUrl = undefined;
        }
    }

    const combinedError = [textError, imageError].filter(Boolean).join('; ');

    return {
      name: parsed.name || this._titleFrom(spec),
      description: parsed.description || this._fallbackDescription(spec),
      grantedMarks: (Array.isArray(parsed.grantedMarks) && parsed.grantedMarks.length ? parsed.grantedMarks.slice(0, 2) : this._defaultMarks(spec)) as Mark[],
      themeOfFate: theme,
      imagePrompt,
      textPrompt,
      spec,
      imageUrl,
      error: combinedError || undefined,
    };
  }

  private _buildTextPrompt(spec: MaskSpec): string {
    const TEXT_SYSTEM = `You are a myth-maker for a dark fantasy roguelike.
Rules:
- Output JSON with keys: name (1-3 words), description (2-3 sentences), grantedMarks (array of 1-2 objects with id,label,value=1).
- Tone: somber, mystical.
- No extra keys. No commentary.`;

    const portent = `A first mask forged under the sign of ${spec.word}, where ${spec.forge.toLowerCase()}.`;
    const twist = `The ${spec.intent.toLowerCase()} strike leaves its trace upon the brow.`;
    return `${TEXT_SYSTEM}

Portent: ${portent} ${twist}
Forge: ${spec.forge}
Inscribed Word: ${spec.word}
Material: ${spec.material}
Motif: ${spec.motif}
Condition: ${spec.condition}
Aura: ${spec.aura}

Generate JSON now.`;
  }

  private _buildImagePrompt(spec: MaskSpec): string {
    return [
      `A single ceremonial mask, portrait, black background. Dark fantasy oil painting.`,
      `Forge context: ${spec.forge}.`,
      `Material: ${spec.material}.`,
      `Motif: ${spec.motif}.`,
      `Condition: ${spec.condition}.`,
      `Aura: ${spec.aura} (no glyphs or text).`,
      `Presentation: ${spec.presentation}.`,
      `Cinematic lighting, intricate detail, atmospheric. NO TEXT, NO LETTERS.`,
    ].join(" ");
  }

  private _titleFrom(spec: MaskSpec): string {
    const forgeNoun = spec.forge.split(/[–—-]/)[0].trim().split(/\s+/).slice(-2).join(" ");
    const wordCore = spec.word.replace(/\(.*?\)/g, "").trim();
    return `${wordCore} of ${forgeNoun}`.replace(/\s+/g, " ").trim();
  }

  private _defaultMarks(spec: MaskSpec): Mark[] {
    const byIntent: Record<MaskSpec["intent"], Mark> = {
      Aggression: { id: "iron-will-scar", label: "Iron Will", value: 1 },
      Wisdom: { id: "echo-sight", label: "Echo Sight", value: 1 },
      Cunning: { id: "shadow-steps", label: "Shadow Steps", value: 1 },
    };
    const wordSlug = spec.word.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return [
      byIntent[spec.intent],
      { id: `${wordSlug}-resonance`, label: "Resonance", value: 1 },
    ];
  }

  private _fateFromWord(spec: MaskSpec): ThemeOfFate {
    const id = spec.word.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return { id: `fate-${id}`, label: `Theme: ${spec.word}` };
  }

  private _fallbackDescription(spec: MaskSpec): string {
    return `Forged at ${spec.forge}, this ${spec.material} mask bears ${spec.motif}. ${spec.condition} marks its making, while ${spec.aura} hints at the word of ${spec.word}.`;
  }

  private async generateFirstMaskText(lexeme: Lexeme, seed: WorldSeed): Promise<Omit<Mask, 'id' | 'imageUrl'>> {
    const prompt = [
        "System: You are a myth-maker for a dark fantasy roguelike. Generate a JSON object for a character's first mask based on a ritual.",
        "Rules:",
        "- The JSON MUST have `name` (string, 1-3 words), `description` (string, evocative, 2-3 sentences), `grantedMarks` (array of 1-2 objects with `id`, `label`, `value: 1`), and `themeOfFate` (an object mapping a domain to a number, e.g. `{\"Aggression\": 1}`).",
        "- The `name` should be creative and related to the chosen word.",
        "- The `description` should incorporate the word's domains, tags, and the portent's theme.",
        "- The `id` for marks should be a simple, machine-readable string (e.g., 'salt-ash-corrosion', 'tide-blade-fury').",
        "- The `value` for marks should be `1`.",
        "- The `themeOfFate` must be derived from the `maskThemeDelta` of the chosen word.",
        "- The tone is somber and mystical.",
        `Portent: "${seed.description}"`,
        `Chosen Word (Lexeme): "${lexeme.gloss}" (ID: ${lexeme.id})`,
        `Domains: ${lexeme.domains.join(", ")}`,
        `Tags: ${lexeme.tags.join(", ")}`,
        `Effects to Inspire: ${JSON.stringify(lexeme.effects)}`,
    ].join("\n");

    const res = await this.ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            grantedMarks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  value: { type: Type.INTEGER }
                },
                propertyOrdering: ["id", "label", "value"],
              }
            },
            themeOfFate: {
              type: Type.OBJECT,
              properties: {
                  Aggression: { type: Type.NUMBER, nullable: true },
                  Wisdom: { type: Type.NUMBER, nullable: true },
                  Cunning: { type: Type.NUMBER, nullable: true },
              }
            }
          },
          propertyOrdering: ["name", "description", "grantedMarks", "themeOfFate"],
        }
      }
    });

    try {
      const parsed = JSON.parse(res.text.trim());
      // Ensure themeOfFate is present, defaulting from lexeme if missing from generation
      if (!parsed.themeOfFate) {
        parsed.themeOfFate = lexeme.effects.maskThemeDelta || {};
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse first mask description JSON:", res.text, e);
      throw new Error("The cultural ether is silent; the mask could not be formed.");
    }
  }

  private async generateFirstMaskImage(description: string, lexeme: Lexeme): Promise<string> {
    const prompt = `A cinematic portrait of a ceremonial mask forged in a dreamlike void. The mask is described as "${description}". It has a faint aura of "${lexeme.gloss.toLowerCase()}". Visual keywords: ${lexeme.tags.join(", ")}. Dark fantasy oil painting style. Rendered as an artifact of myth with dramatic lighting, floating embers, and deep shadows. NO TEXT, NO LETTERS, NO WRITING, text-free, symbol-free, no inscriptions.`;

    const res = await this.ai.models.generateImages({
        model: IMAGE_MODEL,
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });

    if (res.generatedImages && res.generatedImages.length > 0) {
        return `data:image/jpeg;base64,${res.generatedImages[0].image.imageBytes}`;
    }
    
    // Return a placeholder if generation fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
}