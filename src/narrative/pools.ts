import { LineTemplate, ThoughtTemplate } from "./templates";
import { hasMark, topMark, roleIs, recogIs, tensionAtLeast, dispGte, echoHas } from "./preds";

export const ENCOUNTER_LINES: LineTemplate[] = [
  {
    when: [roleIs("WatchCaptain"), recogIs("Known")],
    text: "The watch captain’s eyes flick to your hands, then to your face. A murmur runs along the wall."
  },
  {
    when: [roleIs("WatchCaptain"), recogIs("Suspected"), tensionAtLeast(2)],
    text: "The watch captain squares their stance, voice low: “Name and purpose.” The line behind you tightens."
  },
  {
    when: [roleIs("Guard"), recogIs("Unknown"), tensionAtLeast(1)],
    weight: 0.7,
    text: "A guard notes your approach and taps the haft of a pike. Others take interest."
  },
  {
    when: [roleIs("Mob"), tensionAtLeast(3)],
    text: "A ripple of hostile attention gathers like flint in dry grass."
  },
  {
    text: "The air is thick with unspoken questions."
  }
];

export const THOUGHTS: ThoughtTemplate[] = [
  // Dominant mark
  { when: [topMark("Betrayer")], text: "They count the knives I haven’t drawn." },
  { when: [topMark("Savior")],   text: "Favor fades faster than fear." },
  { when: [topMark("Outcast")],  text: "Exile arrives before I do." },
  { when: [topMark("Monster")],  text: "Their blood knows my name." },
  { when: [topMark("Trickster")],text: "Let them chase the shadow, not me." },
  { when: [topMark("Oathbound")],text: "Hold the line. Hold the word." },
  { when: [topMark("Witness")],  text: "I record them as they judge me." },

  // Dispositions
  { when: [dispGte("Aggression", 4)], text: "Break the gaze before it hardens." },
  { when: [dispGte("Cunning", 4)],    text: "Angle, deflect, leave nothing true." },
  { when: [dispGte("Wisdom", 4)],     text: "Choose the door with fewer ghosts." },

  // Echoes and context
  { when: [echoHas("BurnedBridge")],              text: "Ash has a long memory." },
  { when: [echoHas("HelpedTown")],                text: "Did help purchase any silence?" },
  { when: [recogIs("Known"), tensionAtLeast(2)],  text: "The mask speaks before I can." },
  { weight: 3, when: [roleIs("WatchCaptain")],   text: "Rank hides fear under iron." },
  { when: [roleIs("Merchant")],                   text: "Simple folk, simple problems. Usually." },

  // Fallbacks (keep short)
  { text: "Read the room. Spend nothing extra." },
  { text: "Silence is armor." }
];