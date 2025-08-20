
import { Mark, MarkId } from "./types";

const XP_PER_TIER = 10;

export function applyMarkXP(marks: Mark[], id: MarkId, xp: number): Mark[] {
    const next = [...marks];
    let mark = next.find(m => m.id === id);

    if (!mark) {
        mark = { id, tier: 0, xp: 0, decaysPerRun: 1 };
        next.push(mark);
    }

    mark.xp += xp;

    while (mark.xp >= XP_PER_TIER && mark.tier < 3) {
        mark.xp -= XP_PER_TIER;
        mark.tier++;
    }
    while (mark.xp <= -XP_PER_TIER && mark.tier > -3) {
        mark.xp += XP_PER_TIER;
        mark.tier--;
    }
    
    // Remove if neutral and no xp
    return next.filter(m => m.tier !== 0 || m.xp !== 0);
}

export function decayMarks(marks: Mark[]): Mark[] {
    return marks.map(m => {
        const decayAmount = m.decaysPerRun;
        const currentTotal = m.tier * XP_PER_TIER + m.xp;
        const nextTotal = currentTotal - decayAmount * Math.sign(currentTotal);
        
        const nextTier = Math.trunc(nextTotal / XP_PER_TIER);
        const nextXp = nextTotal % XP_PER_TIER;

        return { ...m, tier: nextTier, xp: nextXp };
    }).filter(m => m.tier !== 0 || m.xp !== 0);
}
