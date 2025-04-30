import React from 'react';
import KeyCharacterInteractions from '../KeyCharacterInteractions/KeyCharacterInteractions';
import InteractionGraph from '../InteractionGraph/InteractionGraph';
import './AnalysisContainer.css';
import { Character } from '../../types';

interface AnalysisContainerProps {
  characters: Character[];
  loading: boolean;
}

const AnalysisContainer: React.FC<AnalysisContainerProps> = ({ characters, loading }) => {
  return (
    <div className="analysis-container">
      {loading ? (
        <div className="shimmer-container">
          <div className="shimmer-text" />
          <div className="shimmer-graph" />
        </div>
      ) : (
        <>
          <InteractionGraph characters={characters} />
          <KeyCharacterInteractions characters={characters} />
        </>
      )}
    </div>
  );
};

export default AnalysisContainer;
