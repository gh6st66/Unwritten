/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Mask, Origin, Lexeme, MaskSpec, Mark, ThemeOfFate, TesterMask } from "../game/types";

async function postToServer<T>(endpoint: string, body: object): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Server request to ${endpoint} failed with status ${response.status}: ${errorBody}`);
  }

  return response.json();
}

export class MaskForger {
  constructor() {
    // API client is no longer initialized here
  }

  public async forgeFirstMask(lexeme: Lexeme, origin: Origin): Promise<Mask> {
    try {
      const response = await postToServer<{ textDetails: Omit<Mask, 'id' | 'imageUrl'>; imageUrl: string }>('/api/forge-first-mask', { lexeme, origin });
      return {
        id: crypto.randomUUID(),
        ...response.textDetails,
        imageUrl: response.imageUrl,
      };
    } catch (e) {
      console.error("Server call to forge first mask failed:", e);
      // Provide a structured fallback
      return {
        id: crypto.randomUUID(),
        name: `Mask of ${lexeme.gloss}`,
        description: `A mask born of ${origin.title}, marked by the word '${lexeme.gloss}'. Its features are indistinct, lost in the ether of a failed creation.`,
        imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        grantedMarks: [],
        themeOfFate: lexeme.effects.maskThemeDelta || {},
      };
    }
  }

  public async forgeFromSpec(spec: MaskSpec, generateImage: boolean = false): Promise<TesterMask> {
    const textPrompt = this._buildTextPrompt(spec);
    const imagePrompt = this._buildImagePrompt(spec);

    try {
      const result = await postToServer<Omit<TesterMask, 'spec' | 'textPrompt' | 'imagePrompt'>>('/api/forge-from-spec', {
        textPrompt,
        imagePrompt,
        generateImage,
      });

      return {
        ...result,
        spec,
        textPrompt,
        imagePrompt,
      };
    } catch (e: any) {
       console.error("Server call to forge from spec failed:", e);
       const error = e instanceof Error ? e.message : "An unknown error occurred during generation.";
       return {
         name: this._titleFrom(spec),
         description: this._fallbackDescription(spec),
         grantedMarks: this._defaultMarks(spec),
         themeOfFate: this._fateFromWord(spec),
         imagePrompt,
         textPrompt,
         spec,
         error,
       };
    }
  }

  // Prompt building logic remains client-side to be sent to the server.
  private _buildTextPrompt(spec: MaskSpec): string {
    const omen = `A first mask forged under the sign of ${spec.word}, where ${spec.forge.toLowerCase()}.`;
    const twist = `The ${spec.intent.toLowerCase()} strike leaves its trace upon the brow.`;
    return `Omen: ${omen} ${twist}\nForge: ${spec.forge}\nInscribed Word: ${spec.word}\nMaterial: ${spec.material}\nMotif: ${spec.motif}\nCondition: ${spec.condition}\nAura: ${spec.aura}`;
  }

  private _buildImagePrompt(spec: MaskSpec): string {
    return [
      `A single ceremonial mask, portrait, black background. Dark fantasy oil painting.`,
      `Forge context: ${spec.forge}.`,
      `Material: ${spec.material}.`,
      `Motif: ${spec.motif}.`,
      `Condition: ${spec.condition}.`,
      `Aura: ${spec.aura}.`,
      `Presentation: ${spec.presentation}.`,
      `Cinematic lighting, intricate detail, atmospheric.`,
      `Rule: Any writing, such as runes or sigils, must appear as diegetic inscriptions carved into or painted onto the mask itself.`,
      `Negative prompt: non-diegetic text, signatures, captions, floating letters, watermarks.`
    ].join(" ");
  }

  // Fallback generation logic remains client-side for resilience.
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
}