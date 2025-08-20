import { GoogleGenAI, Type } from "@google/genai";
import type { ImagePromptSpec } from "./culture/imagePrompts";
import { MaskBlueprint, MaskDescription, MaskSeed, RegionCulture } from "./culture/types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function buildMaskDescriptionPrompt(
  bp: MaskBlueprint,
  culture: RegionCulture,
  seed: MaskSeed
): { system: string; user: string; schema: any } {
  const axes = culture.axes;
  const f = seed.flavor;
  const tone =
    f?.voice === "bureaucratic" ? "formal, precise" :
    f?.voice === "reverent"     ? "solemn, luminous" :
    f?.voice === "gritty"       ? "grounded, tactile" :
    f?.voice === "festive"      ? "playful, kinetic" :
    f?.voice === "hushed"       ? "quiet, intimate" :
    "balanced, descriptive";

  const system =
`You are generating in-world mask descriptions for a narrative roguelike. 
Stay diegetic, low-tech, and culturally consistent. 
Do not reference modern materials, brands, or Earth cultures. 
Write concise, image-rich prose.`;

  const user = [
    `BLUEPRINT: form=${bp.form}, material=${bp.material}, motif=${bp.motif}, wear=${bp.wear}, function=${bp.fn}, color=${bp.color}, finish=${bp.finish}, legal=${bp.legal}`,
    `CONTEXT: centralization=${axes.centralization.toFixed(2)}, piety=${axes.piety.toFixed(2)}, militarization=${axes.militarization.toFixed(2)}, openness=${axes.openness.toFixed(2)}, prosperity=${axes.prosperity.toFixed(2)}, plague=${axes.plaguePressure.toFixed(2)}, iconoclasm=${axes.iconoclasm.toFixed(2)}`,
    f?.tagline ? `SEED_TAGLINE: ${f.tagline}` : "",
    f?.imagery?.length ? `IMAGERY: ${f.imagery.join("; ")}` : "",
    f?.craft?.length ? `CRAFT: ${f.craft.join("; ")}` : "",
    f?.law?.length ? `LAW: ${f.law.join("; ")}` : "",
    f?.ritual?.length ? `RITUAL: ${f.ritual.join("; ")}` : "",
    f?.taboo?.length ? `TABOO: ${f.taboo.join("; ")}` : "",
    `STYLE: tone=${tone}. 110–160 words total. 2 short paragraphs. Avoid anachronisms.`
  ].filter(Boolean).join("\n");

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The evocative title for the mask." },
      summary: { type: Type.STRING, description: "A 1-2 sentence overview of the mask." },
      appearance: { type: Type.STRING, description: "Details on materials, color, motif, and how it's worn." },
      craftNotes: { type: Type.STRING, description: "How the mask is made, any tool marks or specific techniques." },
      ritualUse: { type: Type.STRING },
      legalNote: { type: Type.STRING },
      sensory: { type: Type.STRING },
      variantHook: { type: Type.STRING },
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Short keywords for UI filtering or search." }
    },
    required: ["title","summary","appearance","craftNotes","tags"]
  };

  return { system, user, schema };
}


export async function generateMaskDescription(
  bp: MaskBlueprint,
  culture: RegionCulture,
  seed: MaskSeed
): Promise<MaskDescription> {
  const { system, user, schema } = buildMaskDescriptionPrompt(bp, culture, seed);
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: user }] }],
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const json = response.text.trim();
  return JSON.parse(json) as MaskDescription;
}


export async function generateMaskImage(spec: ImagePromptSpec): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: spec.prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: spec.aspect,
            negativePrompt: spec.negative
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}