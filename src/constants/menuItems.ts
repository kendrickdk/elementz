export interface MenuItem {
  key: string;
  label: string;
  description: string;
  icon?: string;
}

export const menuItems: MenuItem[] = [
  { key: "qtube", label: "Q-Tube", description: "A pipeline for neutrons, protons, and electrons." },
  { key: "tube_tools", label: "TubeTap", description: "Balance flow, merge tubes, or tap to remove items." },
  { key: "wormhole", label: "Wormhole", description: "Instant short-range item transport with no tube." },
  { key: "extractor", label: "Extractor", description: "Extracts neutrons, protons, or electrons from nodes." },
  { key: "divide", label: "Divide", description: "Splits extracted protons or neutrons." },
  { key: "combine", label: "Combine", description: "Combines protons and neutrons." },
  { key: "shell_mixer", label: "Shell Mixer", description: "Mix shell colors to set the right valence (7 colors)." },
  { key: "set_orbit", label: "Set Orbit", description: "Apply color (value) to electrons." },
  { key: "singularity", label: "Singularity", description: "Deletes anything fed into it." }
];
