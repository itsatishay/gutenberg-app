export interface Interaction {
  count: number;
  key_conversations: string[];
  relation?: string;
  with: string;
}

export interface Character {
  name: string;
  interactions: Interaction[];
} 