export type ColorThemeId = 'mono' | 'caffeine' | 'ocean' | 'tangerine' | 'violet' | 'amethyst';

type Swatch = {
  primary: string;
  accent: string;
  background: string;
};

export type ColorTheme = {
  id: ColorThemeId;
  name: string;
  description: string;
  swatch: Swatch;
  darkSwatch: Swatch;
};

export const COLOR_THEMES: readonly ColorTheme[] = [
  {
    id: 'caffeine',
    name: 'Caffeine',
    description: 'Warm coffee tones',
    swatch: {
      primary: 'oklch(0.38 0.08 55)',
      accent: 'oklch(0.93 0.04 80)',
      background: 'oklch(0.97 0.02 70)',
    },
    darkSwatch: {
      primary: 'oklch(0.78 0.1 60)',
      accent: 'oklch(0.22 0.05 55)',
      background: 'oklch(0.15 0.02 50)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Cool aquatic green',
    swatch: {
      primary: 'oklch(0.42 0.12 195)',
      accent: 'oklch(0.92 0.04 200)',
      background: 'oklch(0.96 0.02 195)',
    },
    darkSwatch: {
      primary: 'oklch(0.72 0.14 200)',
      accent: 'oklch(0.22 0.06 195)',
      background: 'oklch(0.15 0.02 195)',
    },
  },
  {
    id: 'tangerine',
    name: 'Tangerine',
    description: 'Vibrant citrus orange',
    swatch: {
      primary: 'oklch(0.62 0.2 40)',
      accent: 'oklch(0.95 0.06 70)',
      background: 'oklch(0.97 0.03 60)',
    },
    darkSwatch: {
      primary: 'oklch(0.75 0.2 45)',
      accent: 'oklch(0.22 0.07 40)',
      background: 'oklch(0.15 0.02 45)',
    },
  },
  {
    id: 'mono',
    name: 'Mono',
    description: 'Neutral grayscale',
    swatch: { primary: 'oklch(0.205 0 0)', accent: 'oklch(0.97 0 0)', background: 'oklch(1 0 0)' },
    darkSwatch: {
      primary: 'oklch(0.922 0 0)',
      accent: 'oklch(0.22 0 0)',
      background: 'oklch(0.145 0 0)',
    },
  },
  {
    id: 'violet',
    name: 'Violet Bloom',
    description: 'Bold purple accent',
    swatch: {
      primary: 'oklch(0.45 0.2 290)',
      accent: 'oklch(0.93 0.04 290)',
      background: 'oklch(0.97 0.02 290)',
    },
    darkSwatch: {
      primary: 'oklch(0.72 0.2 290)',
      accent: 'oklch(0.22 0.07 290)',
      background: 'oklch(0.15 0.02 290)',
    },
  },
  {
    id: 'amethyst',
    name: 'Amethyst Haze',
    description: 'Soft lavender mist',
    swatch: {
      primary: 'oklch(0.52 0.14 310)',
      accent: 'oklch(0.94 0.04 315)',
      background: 'oklch(0.97 0.02 310)',
    },
    darkSwatch: {
      primary: 'oklch(0.74 0.14 315)',
      accent: 'oklch(0.22 0.06 310)',
      background: 'oklch(0.15 0.02 310)',
    },
  },
] as const;

export const DEFAULT_COLOR_THEME: ColorThemeId = 'caffeine';
