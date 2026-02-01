import { MathDifficulty } from '../types';

export interface MathRuleConfig {
  weights: { mul: number; div: number; mix: number };
  mul?: { multiplicandMin: number; multiplicandMax: number; multiplierMin: number; multiplierMax: number };
  div?: { divisorMin: number; divisorMax: number; quotientMin: number; quotientMax: number };
  add?: { minA: number; maxA: number; minB: number; maxB: number };
  sub?: { minA: number; maxA: number; minB: number; maxB: number };
}

export interface WordImportConfig {
  delimiters: string[];
}

export interface GrammarImportConfig {
  pdfDelimiter: string;
  expectedColumns: number;
}

export interface LearningConfig {
  math: Record<MathDifficulty, MathRuleConfig>;
  wordImport: WordImportConfig;
  grammarImport: GrammarImportConfig;
}

export const LEARNING_CONFIG: LearningConfig = {
  math: {
    easy: {
      weights: { mul: 0.4, div: 0.4, mix: 0.2 },
      mul: { multiplicandMin: 10, multiplicandMax: 999, multiplierMin: 2, multiplierMax: 9 },
      div: { divisorMin: 2, divisorMax: 9, quotientMin: 10, quotientMax: 999 },
      add: { minA: 100, maxA: 1000, minB: 100, maxB: 999 },
      sub: { minA: 100, maxA: 1000, minB: 100, maxB: 999 }
    },
    medium: {
      weights: { mul: 0.4, div: 0.4, mix: 0.2 },
      mul: { multiplicandMin: 10, multiplicandMax: 999, multiplierMin: 2, multiplierMax: 9 },
      div: { divisorMin: 2, divisorMax: 9, quotientMin: 10, quotientMax: 999 },
      add: { minA: 100, maxA: 1000, minB: 100, maxB: 999 },
      sub: { minA: 100, maxA: 1000, minB: 100, maxB: 999 }
    },
    challenge: {
      weights: { mul: 0.4, div: 0.4, mix: 0.2 },
      mul: { multiplicandMin: 10, multiplicandMax: 999, multiplierMin: 2, multiplierMax: 9 },
      div: { divisorMin: 2, divisorMax: 9, quotientMin: 10, quotientMax: 999 },
      add: { minA: 100, maxA: 1000, minB: 100, maxB: 999 },
      sub: { minA: 100, maxA: 1000, minB: 100, maxB: 999 }
    }
  },
  wordImport: {
    delimiters: [' - ', ' – ', ' -', '–', '-', ',', '，', '\t']
  },
  grammarImport: {
    pdfDelimiter: '|',
    expectedColumns: 7
  }
};
