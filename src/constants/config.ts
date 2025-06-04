// config.ts - Central place for grid and font configurations

import { Colors } from "./colors";

export const GridConfig = {
  size: 32,    // Size of each grid cell in pixels
  cols: 12,    // Number of columns in the grid
  rows: 10     // Number of rows in the grid
};

// Font styles used throughout the game for consistency and easy tweaking
export const FontStyles = {
  label: { font: "24px Arial", color: Colors.textPrimary, fontStyle: "bold" },  // General labels
  protonLabel: { font: "24px Arial", color: Colors.textOnProton }               // Labels for proton nodes
};

