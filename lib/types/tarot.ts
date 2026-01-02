export interface Card {
  id: string;
  name: string;
  arcanaType: "major" | "minor" | "court";
  arcanaNumber?: string;
  number?: string;
  suit?: string;
  keywords: string[];
  description: string;
  interpretations: string;
  reading: string;
  monologue: string;
  image: string;
  degree?: {
    meaning: string;
    shadow: string;
  };
}

export interface Suit {
  suit: string;
  element: string;
  description: string;
  finalStage: string;
}

export interface Degree {
  degree: string;
  synonyms: string[];
  relatedArcana: string[];
  warnings: string;
  meaning: string;
  shadow: string;
}

export interface Spread {
  type: "single" | "three" | "five";
  positions: string[];
}

export interface CardData {
  cards: Card[];
  suits: Suit[];
  degrees: Degree[];
  spreads: {
    single: Spread;
    three: Spread;
    five: Spread;
  };
}

export interface CardAnalysis {
  position: string;
  card: string;
  analysis: string;
  image: string;
}

export interface Reading {
  id: string;
  timestamp: string;
  intention: string;
  spreadType: "single" | "three" | "five";
  opening: string;
  cards: CardAnalysis[];
  synthesis: string | null;
  oracle: string;
}

export type ReadingStatus =
  | "idle"
  | "drawing"
  | "analyzing"
  | "synthesizing"
  | "oracle"
  | "complete"
  | "error";
