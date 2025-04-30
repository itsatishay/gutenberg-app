import React, { useState } from 'react';
import './KeyCharacterInteractions.css'; // Import updated CSS

interface Interaction {
  count: number;
  key_conversations: string[];
  relation: string;
  with: string;
}

interface Character {
  name: string;
  interactions: Interaction[];
}

interface KeyCharacterInteractionsProps {
  characters: Character[];
}

const KeyCharacterInteractions: React.FC<KeyCharacterInteractionsProps> = ({ characters }) => {
  const [expandedCharacters, setExpandedCharacters] = useState<Set<string>>(new Set());

  // Toggle the visibility of a character's interactions
  const toggleExpand = (characterName: string) => {
    setExpandedCharacters((prevState) => {
      const newExpandedCharacters = new Set(prevState);
      if (newExpandedCharacters.has(characterName)) {
        newExpandedCharacters.delete(characterName);
      } else {
        newExpandedCharacters.add(characterName);
      }
      return newExpandedCharacters;
    });
  };

  const charactersWithKeyConversations = characters.filter(character => 
    character.interactions.some(interaction => interaction.key_conversations.length > 0)
  );

  if (charactersWithKeyConversations.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>Key Character Interactions:</h3>
      <div >
        {charactersWithKeyConversations.map((character) => (
          <div key={character.name} className="main-character-box">
            <div
              className="main-character-name"
              onClick={() => toggleExpand(character.name)}
            >
              {character.name}
              <span className={`expand-icon ${expandedCharacters.has(character.name) ? 'minus' : 'plus'}`}>
                {expandedCharacters.has(character.name) ? '−' : '+'}
              </span>
            </div>
            {/* Only show interactions if the character is expanded */}
            {expandedCharacters.has(character.name) && (
              <div className="sub-character-list">
                {character.interactions
                  .filter(interaction => interaction.key_conversations.length > 0)
                  .map((interaction, index) => (
                  <div key={index} className="sub-character">
                    <span className="sub-character-name">
                      {interaction.with}
                      {interaction.relation && <span className="relation-text"> ({interaction.relation})</span>}
                    </span>
                    <div className="conversation-text">
                      {interaction.key_conversations.map((conversation, i) => (
                        <p key={i}>{conversation}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyCharacterInteractions;
