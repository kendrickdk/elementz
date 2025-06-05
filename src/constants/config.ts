// src/constants/config.ts
import { Colors } from "./colors";

/**
 * GridConfig holds all settings related to the grid layout and appearance.
 * - All colors are imported from Colors for easy customization.
 */
export const GridConfig = {
  cellSize: 64,                     // Size of each grid cell in pixels
  showGrid: true,                   // Toggle grid visibility
  gridLineThickness: 1,             // Thickness of grid lines
  gridLineColor: Colors.gridLines,  // Grid line color from Colors
  centerHubCells: 7,                // Width/height of center hub in cells
  centerHubRadius: 32,              // Corner roundness of hub in pixels
  centerHubBorder: 6,               // Border thickness of center hub
  centerHubFillAlpha: .5,            // Center hub fill opacity (1 = fully opaque)
  centerHubColor: Colors.centerHub, // Center hub color from Colors
};
// src/constants/config.ts
export const ZoomConfig = {
  minZoom: 0.3,    // Minimum allowed zoom level (zoomed out)
  maxZoom: 3,      // Maximum allowed zoom level (zoomed in)
  zoomStep: 0.15   // How much zoom changes per mouse wheel tick
};

/**
 * ChunkConfig for chunked grid rendering (expandable in the future)
 */
export const ChunkConfig = {
  cols: 16,    // Number of columns per chunk
  rows: 16     // Number of rows per chunk
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
  moveSpeed: 16 // Camera movement speed (pixels per frame)
};

/**
 * MovementConfig for smooth camera or entity movement
 */
export const MovementConfig = {
  acceleration: 2400, // pixels per second squared
  maxSpeed: 1200,     // max speed in pixels per second
  drag: 2000          // deceleration in pixels per second squared
};
