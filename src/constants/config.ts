// src/constants/config.ts
import { Colors } from "./colors";

/**
 * GridConfig holds all settings related to the grid layout and appearance.
 */
export const GridConfig = {
  cellSize: 64,           // Size of each grid cell in pixels
  showGrid: true,         // Toggle grid visibility
  gridLineThickness: 1,   // Thickness of grid lines
  gridLineColor: Colors.gridLine, // Use from Colors
  centerHubCells: 4,      // Width/height of center hub in cells
  centerHubRadius: 32,    // Corner roundness of hub in pixels
  centerHubBorder: 6,     // Border thickness of center hub
  centerHubFillAlpha: 0.12, // Center hub fill opacity
  centerHubColor: Colors.centerHub, // Use from Colors
};

/**
 * ChunkConfig for chunked grid rendering (expandable!)
 */
export const ChunkConfig = {
  cols: 16,
  rows: 16
};

/**
 * FontStyles for all text labels (centralized!)
 */
export const FontStyles = {
  label: { font: "24px Arial", color: Colors.textPrimary, fontStyle: "bold" },
  protonLabel: { font: "24px Arial", color: Colors.textOnProton }
};

/**
 * Camera and movement parameters
 */
export const CameraConfig = {
  moveSpeed: 16
};

export const MovementConfig = {
  acceleration: 2400,
  maxSpeed: 1200,
  drag: 2000
};

