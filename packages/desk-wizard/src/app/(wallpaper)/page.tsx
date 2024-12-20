"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Control } from "@/widgets/Wallpaper/classes/programs";
import { loadScreens } from "@/widgets/Wallpaper/classes/ScreenInfo";
import { ScreenWrapper, useCanvas } from "@/widgets/Wallpaper/ProgramProvider";
import { CanvasProgram } from "@/widgets/Wallpaper/classes/CanvasProgram";
import { useTheme } from "next-themes";
import ImagePicker, { imgs } from "../../widgets/Wallpaper/ImagePicker";
import * as tauri from "@tauri-apps/api/core";
import CalendarWidget from "@/widgets/Calendar/CalendarWidget";
import PluginTest from "@/components/PluginTest";

const screens = loadScreens();

export default function Home() {
    const [img, setImg] = useState(imgs[Math.floor(Math.random() * imgs.length)]);
    const [program, setProgram] = useState<CanvasProgram<any, any> | null>(null);
    const { canvasProvider } = useCanvas(screens, program);
    useTheme();

    useLayoutEffect(() => {
        // Redirect to /native-app if running in Tauri
        if (tauri.isTauri()) window.location.href = "/native-app";
    }, []);

    useEffect(() => {
        setProgram(Control.PictureFrame.create(img.src, img.offset, img.mirror));
    }, [img]);

    return (
        <>
            <div className="flex w-full h-full absolute overflow-hidden">
                <ScreenWrapper
                    screenId={0}
                    screens={screens}
                    program={program}
                    provider={canvasProvider}
                >
                    {/* <CalendarWidget /> */}
                    <PluginTest />
                </ScreenWrapper>

                <ScreenWrapper
                    screenId={1}
                    screens={screens}
                    program={program}
                    provider={canvasProvider}
                >
                    <ImagePicker setImg={setImg} />
                </ScreenWrapper>

                <ScreenWrapper
                    screenId={2}
                    screens={screens}
                    program={program}
                    provider={canvasProvider}
                ></ScreenWrapper>
                <div
                    id="desk-window-root"
                    className="absolute overflow-hidden"
                    style={{ width: "100vw", height: "100vh" }}
                ></div>
            </div>
        </>
    );
}
