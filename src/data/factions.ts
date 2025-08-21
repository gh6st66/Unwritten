import { FactionDef } from "../gen";

export const FACTIONS_DATA: FactionDef[] = [
    { 
        id: "faction_inquisition", 
        name: "The Inquisition", 
        tier: 3, 
        ethos: "Purge", 
        methods: ["interrogation", "decrees", "spies"] 
    },
    { 
        id: "faction_clergy", 
        name: "The Clergy", 
        tier: 2, 
        ethos: "Faith", 
        methods: ["sermons", "charity", "relics"] 
    },
    { 
        id: "faction_guild", 
        name: "The Merchant Guild", 
        tier: 2, 
        ethos: "Profit", 
        methods: ["tariffs", "contracts", "monopolies"] 
    },
    { 
        id: "faction_academy", 
        name: "The Academy", 
        tier: 2, 
        ethos: "Knowledge", 
        methods: ["research", "archives", "artifacts"] 
    },
];
