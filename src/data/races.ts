/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { RaceDef } from '../core/types';

export const raceData: RaceDef[] = [
    {
        id: 'race_human',
        name: 'Human',
        description: 'Ambitious and adaptable, humans are the most common sight in these fractured lands. They possess a fierce will, but are often undone by their own fleeting mortality.',
        quote: '"We build our legacies on the bones of a world that has forgotten its own name."',
        traits: ['Adaptable', 'Ambitious', 'Short-lived']
    },
    {
        id: 'race_aether_touched',
        name: 'Aether-touched',
        description: 'Descendants of those who survived the arcane cataclysms, the Aether-touched are marked by strange energies, giving them an innate connection to the world\'s deeper mysteries.',
        quote: '"The world whispers to us. Most of the time, we are wise enough not to listen."',
        traits: ['Arcane Affinity', 'Resilient', 'Feared']
    },
    {
        id: 'race_stoneling',
        name: 'Stoneling',
        description: 'A stoic, patient folk born from the rock and soil of the mountains. Stonelings are incredibly durable and view the world with a geological sense of time.',
        quote: '"The fury of men is but a summer storm. The mountains, and we, endure."',
        traits: ['Durable', 'Patient', 'Stoic']
    },
    {
        id: 'race_deep_kin',
        name: 'Deep-kin',
        description: 'Hailing from the sunless caverns deep beneath the earth, the Deep-kin are masters of subtlety and survival. They move unseen and value secrets above all else.',
        quote: '"The surface-dwellers fear the dark. We simply call it home."',
        traits: ['Stealthy', 'Perceptive', 'Secretive']
    },
    {
        id: 'race_woad',
        name: 'Woad',
        description: 'A tribal people of the wildlands, fiercely independent and deeply connected to the primal spirits of nature. They are warriors and shamans, painted in the blues of their namesake plant.',
        quote: '"The city-folk have their walls of stone. We have the forest, and it is a far better shield."',
        traits: ['Primal', 'Fierce', 'Spiritual']
    }
];
