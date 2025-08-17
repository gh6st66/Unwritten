/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum NodeType {
    COMBAT = 'COMBAT',
    ELITE = 'ELITE',
    BOSS = 'BOSS',
    EVENT = 'EVENT',
    SHOP = 'SHOP',
    REST = 'REST',
}

export enum Zone {
    WILDERNESS = 'WILDERNESS',
    TOWN = 'TOWN',
    RUINS = 'RUINS',
    BOSS = 'BOSS',
}

export interface MapNode {
    id: string;
    step: number;
    type: NodeType;
    encounterId: string;
    position: { x: number; y: number }; // For rendering on a 100x100 grid
    zone: Zone;
}

export interface MapEdge {
    from: string;
    to: string;
}

export interface MapState {
    nodes: MapNode[];
    edges: MapEdge[];
    currentNodeId: string;
    step: number;
    quotas: {
        restGap: number;
        shopsSeenSince: number;
        elitesSeenSince: number;
    };
}