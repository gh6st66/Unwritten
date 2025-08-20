import { MaskSeed } from "./types";

export const seedLibrary: MaskSeed[] = [
  // 1) Water-Trade Guilds
  { id:"seed.water_trade", drivers:["trade","river","guilds","oaths"],
    forms:[{value:"full_face",w:3},{value:"half",w:2},{value:"visor_mirror",w:1}],
    materials:[{value:"reed_wicker",w:3},{value:"paper_lacquer",w:3},{value:"bronze",w:2},{value:"wood",w:2},{value:"glass_obsidian",w:1}],
    motifs:[{value:"riverline",w:4},{value:"geom_grid",w:2},{value:"knotwork",w:2}],
    functions:[{value:"legal_identity",w:3},{value:"trader_toll",w:3},{value:"authority_badge",w:2},{value:"speech_mod",w:1}],
    wear:[{value:"strapped",w:3},{value:"suspended_pendant",w:2},{value:"shoulder_hung",w:1}],
    palette:{hues:[{value:"indigo",w:3},{value:"umber",w:2},{value:"copper",w:2}], finishes:[{value:"lacquer",w:3},{value:"oxidized",w:1}]},
    legalStatus:[{value:"state_standard",w:3},{value:"common",w:2}],
    rituals:["ink_oath","river_dipping","wax_sealing"],
    evolution:[
      {trigger:"centralize",effects:{motifs:[{value:"geom_grid",w:4}]},likelihood:0.6},
      {trigger:"scarcity",effects:{materials:[{value:"bronze",w:-2},{value:"reed_wicker",w:1},{value:"paper_lacquer",w:1}]}},
      {trigger:"migration",effects:{motifs:[{value:"leaf_vein",w:1},{value:"knotwork",w:1}]}}
    ],
    flavor: {
      tagline: "Ledger masks gleam like wet coins and speak in stamps.",
      imagery: ["lacquered reed armature", "bronze seal-plates at the jaw", "river mist beading on indigo", "oath cords knotted in twine"],
      craft: ["paper laminate cured in smoke", "edges waxed and burnished for weather"],
      law: ["registrars check seal alignment at tollgates; forgery draws fines and a public soaking"],
      ritual: ["river-dipping at dawn", "wax sealing after a deal"],
      taboo: ["wearing stamped faces at funerals"],
      voice: "bureaucratic"
    }
  },

  // 2) Volcanic Forge Societies
  { id:"seed.forge_volcanic", drivers:["metallurgy","ash","heat"],
    forms:[{value:"jaw_hinged",w:3},{value:"full_face",w:2},{value:"lattice",w:1}],
    materials:[{value:"bronze",w:4},{value:"iron",w:3},{value:"glass_obsidian",w:2},{value:"leather",w:1}],
    motifs:[{value:"sunburst",w:3},{value:"cracked_glaze",w:2},{value:"teeth_fang",w:2}],
    functions:[{value:"intimidation",w:2},{value:"authority_badge",w:2},{value:"warding",w:2},{value:"festival",w:1}],
    wear:[{value:"strapped",w:3},{value:"hair_pinned",w:1}],
    palette:{hues:[{value:"black",w:3},{value:"gold",w:2},{value:"ember_red",w:2}], finishes:[{value:"oxidized",w:3},{value:"gloss",w:1}]},
    legalStatus:[{value:"sacred",w:2},{value:"common",w:2}],
    rituals:["ash_anointing","forge_quench"],
    evolution:[
      {trigger:"plague",effects:{functions:[{value:"plague_filter",w:2},{value:"warding",w:1}]}},
      {trigger:"golden_age",effects:{materials:[{value:"glass_obsidian",w:1}]}}
    ],
    flavor: {
        tagline: "Ash coats everything; the masks look just born from the kiln.",
        imagery: ["obsidian glass with heat ripples", "hammered bronze catching ember light", "jaw hinges creaking like bellows"],
        craft: ["ash-quenched tempering", "slag inlays chased with sunbursts", "smoke-hardened liners"],
        law: ["smiths mark the inner brow with a slag rune"],
        ritual: ["forge quench over an oath", "ash anointing before campaign"],
        taboo: ["do not polish off the first ash"],
        voice: "gritty"
    }
  },

  // 3) Ancestor-Pastoral Lineages
  { id:"seed.pastoral_ancestor", drivers:["kin","burial_mounds","herding"],
    forms:[{value:"full_face",w:2},{value:"veil",w:2},{value:"headdress_totemic",w:2}],
    materials:[{value:"bone",w:3},{value:"antler",w:2},{value:"textile",w:2},{value:"wood",w:1}],
    motifs:[{value:"scar_stitch",w:3},{value:"leaf_vein",w:2},{value:"eye_glyph",w:1}],
    functions:[{value:"ancestor_channel",w:3},{value:"mourning",w:2},{value:"warding",w:1}],
    wear:[{value:"tied_veil",w:3},{value:"strapped",w:1},{value:"shoulder_hung",w:1}],
    palette:{hues:[{value:"bone",w:3},{value:"soot",w:2},{value:"ochre",w:2}], finishes:[{value:"matte",w:3}]},
    legalStatus:[{value:"sacred",w:3},{value:"common",w:1}],
    rituals:["thread_binding","night_vigil"],
    evolution:[
      {trigger:"war",effects:{functions:[{value:"intimidation",w:2}],motifs:[{value:"teeth_fang",w:2}]}},
      {trigger:"iconoclasm",effects:{legalStatus:[{value:"sacred",w:-2},{value:"taboo",w:2}]}}
    ],
    flavor: {
        tagline: "Bone remembers more than people admit.",
        imagery: ["visible stitch repairs", "tallow-scented veils", "antler tines carved into calm brows"],
        craft: ["bone scraped thin and matte", "cracks bound with thread"],
        law: ["grave masks are heir goods; no trade"],
        ritual: ["night vigil, thread passed from eldest to wearer"],
        taboo: ["no whistling through the eyeholes during procession"],
        voice: "reverent"
    }
  },

  // 4) Desert Caravan Networks
  { id:"seed.caravan_desert", drivers:["distance_trade","secrecy","dust"],
    forms:[{value:"veil",w:3},{value:"visor_mirror",w:2},{value:"half",w:1}],
    materials:[{value:"textile",w:3},{value:"paper_lacquer",w:2},{value:"glass_obsidian",w:1},{value:"leather",w:1}],
    motifs:[{value:"geom_grid",w:2},{value:"riverline",w:2},{value:"eye_glyph",w:2}],
    functions:[{value:"stealth_secret",w:2},{value:"trader_toll",w:2},{value:"warding",w:1},{value:"speech_mod",w:1}],
    wear:[{value:"tied_veil",w:4}],
    palette:{hues:[{value:"sand",w:3},{value:"turquoise",w:2},{value:"copper",w:1}], finishes:[{value:"matte",w:3},{value:"lacquer",w:1}]},
    legalStatus:[{value:"common",w:3},{value:"taboo",w:1}],
    rituals:["dust_consecration","mirror_blind"],
    evolution:[
      {trigger:"scarcity",effects:{materials:[{value:"textile",w:-2},{value:"reed_wicker",w:2}]}},
      {trigger:"centralize",effects:{legalStatus:[{value:"state_standard",w:2}]}},
    ],
     flavor: {
        tagline: "The wind decides; the veil keeps its counsel.",
        imagery: ["mirrored slits flashing at angles", "copper-thread hems", "sand-soft lacquer with turquoise beads"],
        craft: ["tight-weave veils waxed against dust", "mirror chips set behind lattice"],
        law: ["color rights granted by route"],
        ritual: ["dust consecration before departure", "mirror-blind at border stones"],
        taboo: ["unveiling a trader mid-bargain"],
        voice: "festive"
    }
  },

  // 5) Fungal Canopy Symbiosis
  { id:"seed.myco_forest", drivers:["shade","symbiosis","spores"],
    forms:[{value:"lattice",w:3},{value:"headdress_totemic",w:2},{value:"stacked_layered",w:1}],
    materials:[{value:"fungus_chitin",w:4},{value:"wood",w:2},{value:"reed_wicker",w:1}],
    motifs:[{value:"leaf_vein",w:3},{value:"smoke_plume",w:2},{value:"spiral_whorl",w:1}],
    functions:[{value:"warding",w:2},{value:"festival",w:2},{value:"plague_filter",w:1}],
    wear:[{value:"hair_pinned",w:2},{value:"strapped",w:2}],
    palette:{hues:[{value:"moss",w:3},{value:"umber",w:2}], finishes:[{value:"matte",w:3},{value:"lacquer",w:1}]},
    legalStatus:[{value:"sacred",w:2},{value:"common",w:2}],
    rituals:["spore_blessing","dew_curing"],
    evolution:[
      {trigger:"plague",effects:{functions:[{value:"plague_filter",w:2}]}},
      {trigger:"migration",effects:{motifs:[{value:"knotwork",w:1}]}}
    ],
     flavor: {
        tagline: "Breathe with the grove and the mask breathes back.",
        imagery: ["moss-toned chitin ribs", "dew along leaf-vein lattice", "pale spore tassels"],
        craft: ["mycelium lattice grown over frames", "dew-curing under bark presses"],
        law: ["cutting live fruiting bodies requires grove leave"],
        ritual: ["spore blessing whispered into the inner frame"],
        taboo: ["no open flame near hair-pinned crowns"],
        voice: "hushed"
    }
  },

  // 6) Glacier-Edge Survivalists
  { id:"seed.glacier_edge", drivers:["cold","glare","scarcity"],
    forms:[{value:"visor_mirror",w:3},{value:"half",w:2}],
    materials:[{value:"bone",w:3},{value:"leather",w:2},{value:"glass_obsidian",w:1},{value:"textile",w:1}],
    motifs:[{value:"geom_grid",w:2},{value:"scar_stitch",w:2},{value:"constellation",w:2}],
    functions:[{value:"warding",w:2},{value:"legal_identity",w:1},{value:"intimidation",w:1}],
    wear:[{value:"strapped",w:3},{value:"hair_pinned",w:1}],
    palette:{hues:[{value:"chalk_white",w:3},{value:"soot",w:2},{value:"icy_blue",w:1}], finishes:[{value:"matte",w:3}]},
    legalStatus:[{value:"common",w:3}],
    rituals:["sky_curing","ice_smoke"],
    evolution:[
      {trigger:"golden_age",effects:{materials:[{value:"porcelain",w:1}],motifs:[{value:"cracked_glaze",w:1}]}},
      {trigger:"war",effects:{functions:[{value:"intimidation",w:1}]}}
    ],
    flavor: {
        tagline: "White glare bites; a visor is a prayer against the sky.",
        imagery: ["scrimshawed bone", "icy-blue pigment rubbed thin", "star-cut visor mirrors"],
        craft: ["seal-stitched leather bands", "sky-curing under refrozen panes"],
        law: ["visors count as tools; untaxed in lean seasons"],
        ritual: ["ice smoke passed through the slits at dusk"],
        taboo: ["never set a visor face-down in snow"],
        voice: "gritty"
    }
  },

  // 7) Tidal Temple Polities
  { id:"seed.tidal_temple", drivers:["tides","priests","calendars"],
    forms:[{value:"full_face",w:2},{value:"negative_space",w:2},{value:"veil",w:1}],
    materials:[{value:"shell",w:3},{value:"porcelain",w:2},{value:"paper_lacquer",w:1}],
    motifs:[{value:"constellation",w:3},{value:"riverline",w:2},{value:"sunburst",w:1}],
    functions:[{value:"authority_badge",w:2},{value:"pilgrim_vow",w:2},{value:"mourning",w:1}],
    wear:[{value:"suspended_pendant",w:2},{value:"tied_veil",w:2}],
    palette:{hues:[{value:"indigo",w:3},{value:"pearl",w:2}], finishes:[{value:"gloss",w:2},{value:"lacquer",w:2}, {value:"gloss_pearl", w:1}]},
    legalStatus:[{value:"sacred",w:3},{value:"state_standard",w:1}],
    rituals:["moon_bath","salt_prayer"],
    evolution:[
      {trigger:"decentralize",effects:{functions:[{value:"festival",w:2}],legalStatus:[{value:"sacred",w:-1}]}},
      {trigger:"iconoclasm",effects:{forms:[{value:"negative_space",w:3}]}}
    ],
    flavor: {
        tagline: "The tide writes the calendar; masks read it aloud.",
        imagery: ["pearl gloss over shell", "moon-bit crescents of negative space", "star-pricked brow lines"],
        craft: ["thin-poured porcelain ringed and fired", "lacquered tide-lines"],
        law: ["pilgrim pendants valid for one lunar cycle"],
        ritual: ["moon bath on the temple steps", "salt prayer while veiled"],
        taboo: ["no pendant masks within the inner pool unless summoned"],
        voice: "reverent"
    }
  },

  // 8) Ruin-Scavenger Commons
  { id:"seed.ruin_scavenger", drivers:["salvage","bricolage"],
    forms:[{value:"stacked_layered",w:3},{value:"half",w:2}],
    materials:[{value:"wood",w:2},{value:"bronze",w:2},{value:"iron",w:2}],
    motifs:[{value:"scar_stitch",w:3},{value:"cracked_glaze",w:2},{value:"geom_grid",w:1}],
    functions:[{value:"intimidation",w:2},{value:"stealth_secret",w:2},{value:"trader_toll",w:1}],
    wear:[{value:"strapped",w:2},{value:"shoulder_hung",w:2}],
    palette:{hues:[{value:"umber",w:2},{value:"verdigris",w:2}] , finishes:[{value:"oxidized",w:2},{value:"matte",w:2}]},
    legalStatus:[{value:"common",w:3}],
    rituals:["rivet_vigil","soot_marking"],
    evolution:[
      {trigger:"centralize",effects:{legalStatus:[{value:"state_standard",w:1}]}},
    ],
    flavor: {
        tagline: "If it cuts, stamps, or shines, it can be a face.",
        imagery: ["rivet constellations", "mismatched plates with old emblems", "verdigris streaks"],
        craft: ["salvage riveted over wood cores", "cracked glaze stitched with wire"],
        law: ["common right to mask in the heap quarter"],
        ritual: ["rivet vigil; each plate named before fixing"],
        taboo: ["scraping off old emblems without a poured drink"],
        voice: "gritty"
    }
  },

  // 9) Bureau-Scribe States
  { id:"seed.bureau_scribe", drivers:["paperwork","registries","taxes"],
    forms:[{value:"half",w:3},{value:"full_face",w:1}],
    materials:[{value:"paper_lacquer",w:4},{value:"wood",w:1},{value:"bronze",w:1}],
    motifs:[{value:"geom_grid",w:3},{value:"knotwork",w:1},{value:"eye_glyph",w:1}],
    functions:[{value:"legal_identity",w:4},{value:"authority_badge",w:2}],
    wear:[{value:"strapped",w:3},{value:"hand_held",w:1}],
    palette:{hues:[{value:"ink_black",w:3},{value:"red_ochre",w:2}], finishes:[{value:"lacquer",w:2},{value:"matte",w:1}]},
    legalStatus:[{value:"state_standard",w:4}],
    rituals:["stamp_rite","ledger_oath"],
    evolution:[
      {trigger:"decentralize",effects:{functions:[{value:"festival",w:1}],legalStatus:[{value:"state_standard",w:-2}]}},
    ],
    flavor: {
        tagline: "Faces are files, and someone balances them.",
        imagery: ["gridlines under lacquer", "red audit dots on the cheek", "bronze stamps on cords"],
        craft: ["paper laminate pressed in ledger frames", "edges skived flat for sealing"],
        law: ["registry masks required at counters; penalties accrue daily"],
        ritual: ["ledger oath signed under the chin"],
        taboo: ["painting over an issued grid"],
        voice: "bureaucratic"
    }
  },

  // 10) Frontier War-Camps
  { id:"seed.frontier_garrison", drivers:["conflict","cohesion"],
    forms:[{value:"jaw_hinged",w:3},{value:"full_face",w:2}],
    materials:[{value:"iron",w:3},{value:"leather",w:2},{value:"wood",w:1}],
    motifs:[{value:"teeth_fang",w:3},{value:"scar_stitch",w:2}],
    functions:[{value:"intimidation",w:3},{value:"warding",w:2},{value:"legal_identity",w:1}],
    wear:[{value:"strapped",w:4}],
    palette:{hues:[{value:"soot",w:3},{value:"blood_ochre",w:2}], finishes:[{value:"matte",w:2},{value:"oxidized",w:1}]},
    legalStatus:[{value:"state_standard",w:2},{value:"common",w:2}],
    rituals:["blood_inlay","smoke_hardening"],
    evolution:[
      {trigger:"golden_age",effects:{functions:[{value:"intimidation",w:-2},{value:"mourning",w:1}]}}
    ],
    flavor: {
        tagline: "Teeth win arguments. Iron provides witnesses.",
        imagery: ["jaw hinges clacking", "soot-blackened cheek plates", "blood-ochre scars"],
        craft: ["smoke-hardened liners", "iron plates peened into fangs"],
        law: ["intimidation masks allowed on patrol"],
        ritual: ["blood inlay before first watch"],
        taboo: ["no jaw clack during parley"],
        voice: "martial"
    }
  },

  // 11) Market-Carnival Corridors
  { id:"seed.carnival_market", drivers:["festivals","troupes"],
    forms:[{value:"veil",w:2},{value:"stacked_layered",w:2},{value:"headdress_totemic",w:1}],
    materials:[{value:"textile",w:3},{value:"paper_lacquer",w:2},{value:"glass_obsidian",w:1}],
    motifs:[{value:"spiral_whorl",w:3},{value:"sunburst",w:2}],
    functions:[{value:"festival",w:4},{value:"speech_mod",w:1}],
    wear:[{value:"tied_veil",w:3},{value:"hair_pinned",w:1}],
    palette:{hues:[{value:"indigo",w:2},{value:"crimson",w:2},{value:"gold",w:1}], finishes:[{value:"gloss",w:1},{value:"lacquer",w:1}]},
    legalStatus:[{value:"common",w:4}],
    rituals:["ribbon_binding","drum_wake"],
    evolution:[
      {trigger:"plague",effects:{functions:[{value:"plague_filter",w:1}],forms:[{value:"veil",w:1}]}},
      {trigger:"centralize",effects:{functions:[{value:"legal_identity",w:1}]}},
    ],
    flavor: {
        tagline: "Noise wears a face too.",
        imagery: ["ribbons and glass confetti", "spiral whorls catching lantern light", "perfumed lacquer"],
        craft: ["layered veils stitched for sway", "paper rosettes pinned and re-pinned"],
        law: ["festival masks double as stall licenses in some quarters"],
        ritual: ["drum wake to bless a new troupe"],
        taboo: ["silencing a drummer mid-procession"],
        voice: "festive"
    }
  },

  // 12) Mask-Restriction Sects
  { id:"seed.iconoclast_hidden", drivers:["prohibition","secrecy"],
    forms:[{value:"negative_space",w:3},{value:"half",w:2}],
    materials:[{value:"textile",w:2},{value:"paper_lacquer",w:1}],
    motifs:[{value:"eye_glyph",w:2},{value:"smoke_plume",w:2}],
    functions:[{value:"stealth_secret",w:3},{value:"pilgrim_vow",w:1}],
    wear:[{value:"face_painted_negative",w:3},{value:"hand_held",w:2}],
    palette:{hues:[{value:"ash",w:2},{value:"chalk",w:2}], finishes:[{value:"matte",w:3}]},
    legalStatus:[{value:"taboo",w:4}],
    rituals:["ash_vow","silent_procession"],
    evolution:[
      {trigger:"decentralize",effects:{legalStatus:[{value:"taboo",w:-2},{value:"common",w:1}]}},
      {trigger:"migration",effects:{motifs:[{value:"knotwork",w:1},{value:"leaf_vein",w:1}]}}
    ],
    flavor: {
        tagline: "When faces are forbidden, emptiness learns a language.",
        imagery: ["ash and chalk on skin", "hand-held lacquer slivers", "smoke trails through cutouts"],
        craft: ["negative space cut with thread-bound knives"],
        law: ["use is taboo; penalties vary by patrol"],
        ritual: ["silent procession at dawn", "ash vow against idols"],
        taboo: ["do not speak a true name while veiled"],
        voice: "hushed"
    }
  },
];