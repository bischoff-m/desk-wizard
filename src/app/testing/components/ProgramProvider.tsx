import React, { useEffect, useRef } from "react";
import { Screen } from "../types";
import { CanvasProgram } from "../classes/CanvasProgram";
import { CanvasProvider } from "../classes/canvas/CanvasProvider";
import { PerScreenCanvasProvider } from "../classes/canvas/PerScreenCanvasProvider";
import { SpanningCanvasProvider } from "../classes/canvas/SpanningCanvasProvider";

function assertNumberOfScreenChildren(number: number, root: Element) {
  const canvasElements = root.querySelectorAll(".screen-canvas");
  if (canvasElements.length !== number) {
    throw new Error(
      `Expected ${number} ScreenWrapper, but found ${canvasElements.length}`
    );
  }
}

export function useCanvas(
  screens: Screen[],
  program: CanvasProgram<any>,
  root?: HTMLElement
): {
  canvasProvider: CanvasProvider | null;
  ScreenWrapper: React.FunctionComponent<Parameters<typeof ScreenWrapper>[0]>;
} {
  const providerRef = useRef<CanvasProvider | null>(null);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  function ScreenWrapper(props: {
    screenId: number;
    children?: React.ReactNode;
  }) {
    const { screenId, children } = props;
    if (screenId < 0 || screenId >= screens.length)
      throw new Error(`Screen ID ${screenId} out of range`);
    return (
      <div
        className="absolute"
        style={{
          left: screens[screenId].pageSize.topLeft.x,
          top: screens[screenId].pageSize.topLeft.y,
          width: screens[screenId].pageSize.w,
          height: screens[screenId].pageSize.h,
          backgroundImage: "url('/annapurna-massif.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <main className="screen-wrapper flex flex-row justify-center items-center h-full w-full">
          {children}
          {program.canvasPlacement === "per-screen" && (
            <canvas
              className="screen-canvas absolute w-full h-full"
              width={screens[screenId].screenSize.w}
              height={screens[screenId].screenSize.h}
            />
          )}
        </main>
      </div>
    );
  }

  useEffect(() => {
    const placement = program.canvasPlacement;
    const newRoot = root || document.body;
    const screenElements = newRoot.querySelectorAll(".screen-wrapper");

    // Test preconditions
    if (screenElements.length === 0)
      throw new Error("No ScreenWrapper components found");
    if (screenElements.length > screens.length)
      throw new Error(
        `Expected at most ${screens.length} ScreenWrapper, but found ${screenElements.length}`
      );
    if (placement !== "per-screen" && placement !== "spanning")
      throw new Error("Invalid CanvasProgram.canvasPlacement");

    // Initialize canvasRefs
    if (canvasRefs.current.length === 0) {
      if (placement === "per-screen") {
        for (const screenEl of screenElements) {
          assertNumberOfScreenChildren(1, screenEl);
          // Add canvas to canvasRefs
          const canvas = screenEl.querySelectorAll(".screen-canvas");
          canvasRefs.current.push(canvas[0] as HTMLCanvasElement);
        }
      } else {
        for (const screenEl of screenElements)
          assertNumberOfScreenChildren(0, screenEl);
        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.classList.add("screen-canvas absolute w-full h-full");
        canvasRefs.current.push(canvas);
        // Add canvas to root
        newRoot.appendChild(canvas);
      }
    }

    // Initialize canvasProvider
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (placement === "per-screen") {
      providerRef.current = new PerScreenCanvasProvider(
        program,
        screens,
        canvasRefs.current
      );
    } else {
      providerRef.current = new SpanningCanvasProvider(
        program,
        canvasRefs.current[0]
      );
    }

    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { canvasProvider: providerRef.current, ScreenWrapper };
}