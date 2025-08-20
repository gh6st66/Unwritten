import React, { useState, useEffect } from "react";
import { RunState } from "../core/types";
import { RegionCulture, MaskDescription, MaskBlueprint, MaskSeed } from "../systems/culture/types";
import { generateRegionCulture } from "../systems/culture/synth";
import { seedLibrary } from "../systems/culture/seedLibrary";
import { generateMaskDescription, generateMaskImage } from "../systems/GeminiService";
import { buildImagePrompt, ImagePromptSpec } from "../systems/culture/imagePrompts";
import "../styles/maskCultureModal.css";

interface Props {
  state: RunState;
  onClose: () => void;
}

type GenerationStatus = "idle" | "generating" | "success" | "error";

export const MaskCultureModal: React.FC<Props> = ({ state, onClose }) => {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [culture, setCulture] = useState<RegionCulture | null>(null);
  const [description, setDescription] = useState<MaskDescription | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      setStatus("generating");
      try {
        const [x, y] = [0, 0]; // Placeholder coordinates
        const ctx = {
          worldSeed: 1234, // Placeholder worldSeed
          x,
          y,
          era: Math.floor(state.generationIndex / 10), // Era changes every 10 runs
        };

        const generatedCulture = await generateRegionCulture(ctx);
        setCulture(generatedCulture);

        // For simplicity, we'll describe and generate an image for the most popular mask
        const bp = generatedCulture.popular[0];
        const seed = seedLibrary.find(s => generatedCulture.baseSeeds[0] === s.id) ?? seedLibrary[0];
        const imagePromptSpec = buildImagePrompt(bp, generatedCulture, seed);

        // Generate description and image in parallel
        const [desc, imgUrl] = await Promise.all([
            generateMaskDescription(bp, generatedCulture, seed),
            generateMaskImage(imagePromptSpec),
        ]);

        setDescription(desc);
        setImageUrl(imgUrl);
        setStatus("success");
      } catch (e) {
        console.error("Failed to generate mask culture:", e);
        setError("Could not generate mask culture. The spirits are silent.");
        setStatus("error");
      }
    };

    generate();
  }, [state]);

  return (
    <div className="mask-culture-modal-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <div className="mask-culture-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close">&times;</button>
        {status === "generating" && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Weaving the threads of culture...</p>
          </div>
        )}
        {status === "error" && <div className="error-state">{error}</div>}
        {status === "success" && culture && imageUrl && description && (
          <div className="culture-display">
            <div className="culture-image">
                <img src={imageUrl} alt={description.title} />
            </div>
            <div className="culture-details">
                <h2>{description.title}</h2>
                <p className="summary">{description.summary}</p>
                <div className="detail-section">
                    <h3>Appearance</h3>
                    <p>{description.appearance}</p>
                </div>
                <div className="detail-section">
                    <h3>Craft</h3>
                    <p>{description.craftNotes}</p>
                </div>
                {description.ritualUse && <div className="detail-section"><h3>Ritual Use</h3><p>{description.ritualUse}</p></div>}
                {description.legalNote && <div className="detail-section"><h3>Legality</h3><p>{description.legalNote}</p></div>}
                <div className="tags">
                    {description.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};