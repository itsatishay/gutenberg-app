import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import './InteractionGraph.css';
import { Character } from '../../types';

interface InteractionGraphProps {
  characters: Character[];
}

const InteractionGraph: React.FC<InteractionGraphProps> = ({ characters }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Construct node data for each character
    const nodes = characters.map((character, index) => ({
      id: index,
      label: character.name,
      shape: 'box',
      font: { size: 15 },
    }));

    // Construct edge data, merging interactions for each pair
    const edgeMap: { [key: string]: { from: number, to: number, count: number, lines: string[] } } = {};
    characters.forEach((char, index) => {
      const sourceId = index;
      char.interactions.forEach((interaction) => {
        const targetName = interaction.with;
        const targetIndex = characters.findIndex((c) => c.name === targetName);
        if (targetIndex === -1) return; // If the target character not exist skip it

        const edgeKey = sourceId < targetIndex ? `${sourceId}-${targetIndex}` : `${targetIndex}-${sourceId}`;
        
        if (!edgeMap[edgeKey]) {
          edgeMap[edgeKey] = { from: sourceId, to: targetIndex, count: 0, lines: [] };
        }

        edgeMap[edgeKey].count += interaction.count;
        edgeMap[edgeKey].lines.push(...interaction.key_conversations);
      });
    });

    // Construct edges array with proper width and html tooltip
    const edges = Object.values(edgeMap).map((edge) => ({
      from: edge.from,
      to: edge.to,
      width: edge.count, 
      title: `Key Conversations: ${edge.lines.join(', ')}`, 
    }));

    
    const data = { nodes, edges };
    const options = {
      interaction: {
        zoomable: false, 
        dragNodes: false, 
        dragView: false, 
        hover: true, 
      },
      edges: {
        smooth: false, 
      },
      layout: {
        randomSeed: 2,
      },
      physics: {
        enabled: true,
      },
      nodes: {
        font: {
          align: 'center',
        },
      },
      tooltip: {
        followMouse: true,
        maxWidth: 300, 
      },
    };

    new Network(containerRef.current, data, options);

    return () => {
      if (containerRef.current) {
        const network = new Network(containerRef.current, data, options);
        network.destroy();
      }
    };
  }, [characters]);

  return (
    <div>
      <h2>Character Interaction Graph</h2>
      <div className="interaction-legend">
        <div className="legend-item">
          <div className="interaction-line low" /> <span>Low Interaction</span>
        </div>
        <div className="legend-item">
          <div className="interaction-line high" /> <span>High Interaction</span>
        </div>
      </div>
      <div
        className="disable-mouse-gestures"
        ref={containerRef}
        style={{ height: '500px', width: '100%' }}
      />
    </div>
  );
};

export default InteractionGraph;
