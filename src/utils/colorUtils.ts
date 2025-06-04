// colorUtils.ts - Helper function to convert hex color strings to numeric format for Phaser

/**
 * Converts a hex color string like "#ff3366" to a number 0xff3366.
 * Phaser expects colors as numbers, but strings are easier to edit.
 * @param hex - The hex color string, including the leading '#'
 * @returns The numeric representation of the color for Phaser
 */
export function hexToNumber(hex: string): number {
  return parseInt(hex.slice(1), 16);
}
