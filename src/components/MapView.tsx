/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { MapState, MapNode, NodeType } from '../core/mapTypes';
import '../styles/map.css';

interface MapViewProps {
  mapState: MapState;
  onSelectNode: (node: MapNode) => void;
}

const nodeIcons: Record<NodeType, string> = {
    [NodeType.COMBAT]: '⚔️',
    [NodeType.ELITE]: '💀',
    [NodeType.BOSS]: '👑',
    [NodeType.EVENT]: '?',
    [NodeType.SHOP]: '💰',
    [NodeType.REST]: '🔥',
}

const getBezierPath = (p1: { x: number; y: number }, p2: { x: number; y: number }): string => {
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    const centerX = 50;
    const centerY = 50;

    // Nudge the control point towards the center to create a curve
    const controlX = midX + (centerX - midX) * 0.2;
    const controlY = midY + (centerY - midY) * 0.2;
    
    return `M ${p1.x} ${p1.y} Q ${controlX} ${controlY} ${p2.x} ${p2.y}`;
}

const MapView: React.FC<MapViewProps> = ({ mapState, onSelectNode }) => {
    const { nodes, edges, step, currentNodeId } = mapState;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    return (
        <div className="map-view-container" role="application" aria-label="Game Map">
            <svg className="map-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMin meet">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                {/* Render connections */}
                {edges.map(edge => {
                    const fromNode = nodeMap.get(edge.from);
                    const toNode = nodeMap.get(edge.to);
                    if (!fromNode || !toNode) return null;

                    const isTraversed = fromNode.step < step -1 || fromNode.id === currentNodeId;
                    
                    return (
                        <path
                            key={`${edge.from}-${edge.to}`}
                            className={`map-connection ${isTraversed ? 'is-traversed' : ''}`}
                            d={getBezierPath(fromNode.position, toNode.position)}
                            fill="none"
                        />
                    );
                })}

                {/* Render nodes */}
                {nodes.map(node => {
                    const isAvailable = node.step === step;
                    const isCompleted = node.step < step;
                    const isCurrent = node.id === currentNodeId;
                    
                    let nodeClass = "map-node";
                    if (isAvailable) nodeClass += " is-available";
                    else if (isCompleted) nodeClass += " is-completed";
                    if(isCurrent) nodeClass += " is-current";

                    const handleNodeClick = () => {
                        if (isAvailable) {
                            onSelectNode(node);
                        }
                    };

                    return (
                        <g 
                            key={node.id} 
                            className={nodeClass} 
                            data-type={node.type}
                            onClick={handleNodeClick}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNodeClick()}
                            role="button"
                            tabIndex={isAvailable ? 0 : -1}
                            aria-label={`${node.type} encounter. ${isAvailable ? 'Available' : isCompleted ? 'Completed' : 'Locked'}`}
                        >
                            <circle cx={node.position.x} cy={node.position.y} r="6" />
                            <text x={node.position.x} y={node.position.y + 0.5}>{nodeIcons[node.type]}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default MapView;