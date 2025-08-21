import { describe, it, expect } from "vitest";
import { makeRNG } from "../rng";

describe("makeRNG", () => {
    it("produces a deterministic stream of numbers", () => {
        const r1 = makeRNG("test-seed");
        const r2 = makeRNG("test-seed");
        const a = Array.from({ length: 5 }, () => r1.next());
        const b = Array.from({ length: 5 }, () => r2.next());
        expect(a).toEqual(b);
    });

    it("produces different streams for different seeds", () => {
        const r1 = makeRNG("seed-a");
        const r2 = makeRNG("seed-b");
        const a = Array.from({ length: 5 }, () => r1.next());
        const b = Array.from({ length: 5 }, () => r2.next());
        expect(a).not.toEqual(b);
    });
});
