import { Matrix, matrix } from "mathjs";
import seedrandom from "seedrandom";
import { createNoise3D } from "simplex-noise";
import Victor from "victor";
import {
  ProgramControl2D,
  ScreenTransform,
  createDefaultProgram,
} from "../ProgramControl";
import { ProgramState } from "../ProgramState";
import { Dimensions } from "../../types";

class NoiseParticlesState extends ProgramState {
  gap: number = 30;
  nodeSize: number = 10;
  noiseScale: number = 5;
  noise: Matrix = matrix();
  noiseFunction: (x: number, y: number, z: number) => number = (x, y, z) => 0;

  constructor(
    public sizeInPixel: Dimensions,
    public screenLayout: (Dimensions & { x: number; y: number })[]
  ) {
    super(sizeInPixel, screenLayout, { fps: 60 });

    const prng = seedrandom("my seed");
    this.noiseFunction = createNoise3D(prng);
  }

  protected updateShared(): void {
    const { w, h } = this.sizeInPixel;
    const numberX = Math.ceil(w / this.gap);
    const numberY = Math.ceil((h / this.gap) * 2);
    const timeScale = 0.0001;
    const timeOffset = 0;

    for (let i = 0; i < numberX; i++) {
      for (let j = 0; j < numberY; j++) {
        this.noise.set(
          [i, j],
          this.noiseFunction(
            (i / numberX) * this.noiseScale,
            (j / 2 / numberY) * this.noiseScale,
            this.time * timeScale + timeOffset
          )
        );
      }
    }
  }
}

class NoiseParticlesControl extends ProgramControl2D {
  constructor(
    protected canvas: HTMLCanvasElement,
    protected sharedState: NoiseParticlesState,
    protected transform: ScreenTransform
  ) {
    super(canvas, sharedState, transform);
  }

  draw(): void {
    const { w, h } = this.sharedState.sizeInPixel;
    const { noise, gap, nodeSize } = this.sharedState;
    // Clear the canvas
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = "#222230";
    this.ctx.fillRect(0, 0, w, h);

    // Draw triangle for each node
    for (let i = 0; i < noise.size()[0]; i++) {
      for (let j = 0; j < noise.size()[1]; j++) {
        const noiseValue = noise.get([i, j]);
        let node = new Victor(i * gap, j * (gap / 2));
        const cornerVector = new Victor(0, nodeSize * noiseValue);
        if (j % 2 === 0) node.addScalarX(gap / 2);

        this.ctx.fillStyle = `rgba(200, 100, 100, 1)`;
        // this.ctx.strokeStyle = "black";
        this.ctx.beginPath();
        const corner1 = node.clone().add(cornerVector);
        this.ctx.moveTo(corner1.x, corner1.y);
        cornerVector.rotateDeg(90);
        const corner2 = node.clone().add(cornerVector);
        this.ctx.lineTo(corner2.x, corner2.y);
        cornerVector.rotateDeg(90);
        const corner3 = node.clone().add(cornerVector);
        this.ctx.lineTo(corner3.x, corner3.y);
        cornerVector.rotateDeg(90);
        const corner4 = node.clone().add(cornerVector);
        this.ctx.lineTo(corner4.x, corner4.y);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
  }
}

const handle = {
  create: () =>
    createDefaultProgram(NoiseParticlesControl, NoiseParticlesState),
};
export default handle;