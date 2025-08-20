
import town_gate from "./encounters/town_gate.js";
import help_the_miller from "./encounters/help_the_miller.js";
import { Encounter } from "../core/types";

// This file now acts as an aggregator for all encounter JSON files.
export const encounters: Encounter[] = [
    town_gate as Encounter,
    help_the_miller as Encounter,
];