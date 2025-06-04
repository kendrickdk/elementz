/**
 * Colors holds all color constants used throughout the game.
 * Colors are stored as hex strings. Alpha (opacity) is specified separately when needed.
 */
export const Colors = {
  proton: "#ff3366",                // Pinkish-red color for proton nodes
  centerCircleFill: "#000000",      // Bright yellow fill for center circles
  centerCircleStroke: "#000000",    // Yellow-orange stroke for center circles

  // Center block fill color and alpha (opacity)
  centerBlockFillColor: "#000000",  // Yellow fill for center 8x8 block
  centerBlockFillAlpha: 1,        // Opacity for the center block fill (0 to 1)
  centerBlockStrokeColor: "#ffcc00",// Stroke color for the center block

  textPrimary: "#333333",            // Dark text color for general labels
  textOnProton: "#ffffff",           // White text color for proton labels
  background: "#474779",             // Background color of the game
  gridLines: "#333355"               // Grid line color (dark blue)
};

