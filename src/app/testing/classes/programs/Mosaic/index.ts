import { AnimationSettings, ScreenInfo } from "@/app/testing/types";
import * as twgl from "twgl.js";
import { createDefaultProgram } from "../../CanvasProgram";
import { OrthographicWebGLControl } from "../../control/WebGLControl";
import { WebGLState } from "../../state/WebGLState";
import fsSource from "./fragment.glsl";
import vsSource from "./vertex.glsl";

class MosaicState extends WebGLState {
  override meshArrays: twgl.Arrays;
  constructor(
    override screens: ScreenInfo[],
    override animationSettings: AnimationSettings
  ) {
    super(screens, animationSettings, vsSource, fsSource);
    this.meshArrays = this.getMeshArrays();
  }

  private getMeshArrays(): twgl.Arrays {
    const plane = twgl.primitives.createPlaneVertices(
      this.totalSize.w,
      this.totalSize.h
    );
    twgl.primitives.reorientVertices(plane, twgl.m4.rotationX(Math.PI * 0.5));
    twgl.primitives.reorientVertices(
      plane,
      twgl.m4.translation([this.totalSize.w / 2, this.totalSize.h / 2, -1])
    );
    return plane;
  }
}

class MosaicControl extends OrthographicWebGLControl<MosaicState> {
  constructor(
    override canvas: HTMLCanvasElement,
    override sharedState: MosaicState
  ) {
    super(canvas, sharedState);
  }

  override drawScreen(): void {
    // Setup canvas
    this.gl.clearColor(0.13, 0.13, 0.19, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  override getCustomUniforms(): object {
    return {
      u_time: this.sharedState.time,
    };
  }
}

export const Mosaic = {
  create: createDefaultProgram(
    "spanning",
    { animate: true, fps: 60 },
    MosaicControl,
    MosaicState
  ),
};