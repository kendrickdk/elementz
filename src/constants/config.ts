import { Colors } from "./colors";

/**
 * GridConfig holds all settings related to the grid layout and appearance.
 */
export const GridConfig = {
  size: 32,          // Size of each grid cell in pixels
  cols: 12,          // Number of columns in the grid
  rows: 10,          // Number of rows in the grid
  
  /**
   * cornerRadius defines how rounded the grid cell corners are.
   * - 0 means sharp corners (square cells)
   * - Maximum recommended is half of the grid size (which makes cells circular)
   */
  cornerRadius: 20,
  showGrid: true,   // Toggle to show/hide the grid
};

export const ChunkConfig = {
  cols: 16,   // Number of columns in one chunk
  rows: 16    // Number of rows in one chunk
};

/**
 * FontStyles centralizes font and color settings for text elements.
 */
export const FontStyles = {
  label: { font: "24px Arial", color: Colors.textPrimary, fontStyle: "bold" },  // General labels
  protonLabel: { font: "24px Arial", color: Colors.textOnProton }               // Labels on proton nodes
};

/**
 * MovementConfig centralizes camera movement parameters.
 */
export const MovementConfig = {
  acceleration: 2400,  // pixels per second squared
  maxSpeed: 1200,       // max speed in pixels per second
  drag: 2000           // deceleration in pixels per second squared
};

