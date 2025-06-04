import Phaser from "phaser";
import Chunk from "./Chunk";
import { ChunkConfig, GridConfig } from "../constants/config";

export default class ChunkManager {
  scene: Phaser.Scene;
  loadedChunks: Map<string, Chunk>;
  loadRadius: number;
  private lastCameraChunkPos: { col: number; row: number } | null = null;

  constructor(scene: Phaser.Scene, loadRadius = 1) {
    this.scene = scene;
    this.loadRadius = loadRadius;
    this.loadedChunks = new Map();
  }

  worldToChunkCoords(x: number, y: number): { col: number; row: number } {
    const col = Math.floor(x / (GridConfig.size * ChunkConfig.cols));
    const row = Math.floor(y / (GridConfig.size * ChunkConfig.rows));
    return { col, row };
  }

  /**
   * Updates chunks based on camera position and passes center block info to chunks.
   * @param camera - Active Phaser camera
   * @param centerBlockInfo - Global center block coordinates and size
   */
  update(
    camera: Phaser.Cameras.Scene2D.Camera,
    centerBlockInfo: { startCol: number; startRow: number; cols: number; rows: number }
  ) {
    const camCenterX = Math.floor(camera.scrollX + camera.width / 2);
    const camCenterY = Math.floor(camera.scrollY + camera.height / 2);

    const { col: centerCol, row: centerRow } = this.worldToChunkCoords(camCenterX, camCenterY);

    if (
      this.lastCameraChunkPos &&
      this.lastCameraChunkPos.col === centerCol &&
      this.lastCameraChunkPos.row === centerRow
    ) {
      return; // Camera is still in same chunk — no update needed
    }

    this.lastCameraChunkPos = { col: centerCol, row: centerRow };

    const neededChunks = new Set<string>();

    for (let r = centerRow - this.loadRadius; r <= centerRow + this.loadRadius; r++) {
      for (let c = centerCol - this.loadRadius; c <= centerCol + this.loadRadius; c++) {
        const key = `${c},${r}`;
        neededChunks.add(key);

        if (!this.loadedChunks.has(key)) {
          const chunk = new Chunk(this.scene, c, r, centerBlockInfo);
          this.loadedChunks.set(key, chunk);
          console.log(`Loading chunk at ${key}`);
        }
      }
    }

    for (const key of this.loadedChunks.keys()) {
      if (!neededChunks.has(key)) {
        const chunk = this.loadedChunks.get(key);
        if (chunk) {
          chunk.container.destroy();
          this.loadedChunks.delete(key);
          console.log(`Unloading chunk at ${key}`);
        }
      }
    }

    console.log(`Currently loaded chunks: ${this.loadedChunks.size}`);
  }
}




