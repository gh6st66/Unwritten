import { describe, it, expect } from "vitest";
import { resolveLexeme } from "../resolveLexeme";
import type { SpeakerContext } from "../../../game/types";

describe("resolveLexeme", () => {
  it("returns 'Ledger of Transgressions' for inquisition", () => {
    const ctx: SpeakerContext = {
      affiliations: ["inquisition"],
      locale: "en-GB",
      region: "en-GB",
    };
    expect(resolveLexeme("fateRecord", ctx)).toBe("Ledger of Transgressions");
  });

  it("returns 'Book of Deeds' for clergy", () => {
    const ctx: SpeakerContext = {
      affiliations: ["clergy"],
      locale: "en-US",
      region: "en-US",
    };
    expect(resolveLexeme("fateRecord", ctx)).toBe("Book of Deeds");
  });

  it("returns 'Register' for bureaucracy in en-GB", () => {
    const ctx: SpeakerContext = {
      affiliations: ["bureaucracy"],
      locale: "en-GB",
      region: "en-GB",
    };
    expect(resolveLexeme("fateRecord", ctx)).toBe("Register");
  });

  it("returns 'Ledger' for bureaucracy in en-US", () => {
    const ctx: SpeakerContext = {
      affiliations: ["bureaucracy"],
      locale: "en-US",
      region: "en-US",
    };
    expect(resolveLexeme("fateRecord", ctx)).toBe("Ledger");
  });

  it("falls back to 'Record' when nothing matches", () => {
    const ctx: SpeakerContext = {
      affiliations: [],
      locale: "es-ES",
      region: "es-ES",
    };
    expect(resolveLexeme("fateRecord", ctx)).toBe("Record");
  });
  
  it("prioritizes stronger affiliation when multiple are present", () => {
    const ctx: SpeakerContext = {
      affiliations: ["inquisition", "military"],
      locale: "en-US",
      region: "en-US",
    };
    // Inquisition rule has higher weight and match score
    expect(resolveLexeme("fateRecord", ctx)).toBe("Ledger of Transgressions");
  });
});