import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import './InteractionGraph.css';

interface Interaction {
  count: number;
  key_conversations: string[];
  with: string;
}

interface Character {
  name: string;
  interactions: Interaction[];
}

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
    const edgeMap: { [key: string]: { from: number, to: number, count: number, lines: string[] } } = {}; // Track edges by pair key
    characters.forEach((char, index) => {
      const sourceName = char.name;
      const sourceId = index;
      char.interactions.forEach((interaction) => {
        const targetName = interaction.with;
        const targetIndex = characters.findIndex((c) => c.name === targetName);
        if (targetIndex === -1) return; // If the target character doesn't exist, skip it

        const edgeKey = sourceId < targetIndex ? `${sourceId}-${targetIndex}` : `${targetIndex}-${sourceId}`;
        
        if (!edgeMap[edgeKey]) {
          edgeMap[edgeKey] = { from: sourceId, to: targetIndex, count: 0, lines: [] };
        }

        edgeMap[edgeKey].count += interaction.count;
        edgeMap[edgeKey].lines.push(...interaction.key_conversations);
      });
    });

    // Construct edges array with proper width and HTML tooltip
    const edges = Object.values(edgeMap).map((edge) => ({
      from: edge.from,
      to: edge.to,
      width: edge.count, // Set width based on the interaction count
      title: `Key Conversations: ${edge.lines.join(', ')}`, // Tooltip with HTML content
    }));

    // Create the network data
    const data = { nodes, edges };
    const options = {
      interaction: {
        zoomable: false, // Disable zooming
        dragNodes: false, // Disable node dragging
        dragView: false, // Disable panning
        hover: true, // Enable hover for edge details
      },
      edges: {
        smooth: false, // Disable arrows and make edges simple
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
        maxWidth: 300, // Set max width for the tooltip
      },
    };

    // Initialize the network
    new Network(containerRef.current, data, options);

    // Cleanup on unmount
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
