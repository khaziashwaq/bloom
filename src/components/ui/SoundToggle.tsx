"use client";

import { Music2, Volume2, VolumeX } from "lucide-react";
import { sound } from "@/lib/sound";
import { useSettings } from "@/lib/store";

export function SoundToggle({ className = "" }: { className?: string }) {
  const { sfx, music, setSfx, setMusic } = useSettings();
  return (
    <div className={`flex items-center gap-1 rounded-full bg-paper/85 p-1 ring-1 ring-cocoa/10 backdrop-blur ${className}`}>
      <button
        type="button"
        aria-label={sfx ? "Mute sound effects" : "Turn on sound effects"}
        aria-pressed={sfx}
        title={sfx ? "Sound effects on" : "Sound effects off"}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${sfx ? "bg-blush text-cocoa" : "text-cocoa-soft hover:bg-cocoa/5"}`}
        onClick={() => {
          sound.unlock();
          setSfx(!sfx);
          if (!sfx) setTimeout(() => sound.play("pick"), 30);
        }}
      >
        {sfx ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
      <button
        type="button"
        aria-label={music ? "Stop the music" : "Play soft music"}
        aria-pressed={music}
        title={music ? "Music on" : "Music off"}
        className={`relative flex h-8 w-8 items-center justify-center rounded-full transition ${music ? "bg-lavender text-cocoa" : "text-cocoa-soft hover:bg-cocoa/5"}`}
        onClick={() => {
          sound.unlock();
          setMusic(!music);
        }}
      >
        <Music2 size={16} className={music ? "" : "opacity-50"} />
        {music && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-[glow-pulse_1.6s_ease-in-out_infinite] rounded-full bg-rosewood" />}
      </button>
    </div>
  );
}
