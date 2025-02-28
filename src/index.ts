import React from "react";

export declare type Direction =
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "topRight"
    | "bottomRight"
    | "bottomLeft"
    | "topLeft";

export type ResizableDelta = {
    width: number;
    height: number;
};
export type Position = {
    x: number;
    y: number;
};

export type WindowClass = new (manager: WindowManager) => WindowBase;

export abstract class WindowManager {
    constructor() {}

    public abstract newWindow(key: string, windowClass: WindowClass): void;

    public abstract destroyWindow(key: string): void;
}

/**
 * Usage:
 * const container = document.getElementById('app');
 * const root = createRoot(container!);
 * let window = new Window("ImagePicker", 600, 1000);
 * window.open(root);
 *
 *
 * TODO:
 * Think about the life cycle of a window. Render the component before showing it and have
 * an animation for the window to appear. Same for closing the window.
 */
export abstract class WindowBase {
    manager: WindowManager;
    component: React.ReactElement | null = null;

    constructor(manager: WindowManager) {
        this.manager = manager;
    }

    public abstract getTitle(): string;

    public abstract getIcon(): string;

    public abstract render(): React.JSX.Element;

    public onLoad?(): void;

    public onResizeStop?(
        e: MouseEvent | TouchEvent,
        dir: Direction,
        elementRef: HTMLElement,
        delta: ResizableDelta,
        position: Position
    ): void;

    public attemptClose(): boolean {
        return true;
    }
}

export abstract class PluginBase {
    manager: WindowManager;

    constructor(manager: WindowManager) {
        this.manager = manager;
    }

    public abstract onStartup(): void;
}
