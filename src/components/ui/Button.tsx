"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { sound } from "@/lib/sound";

type Variant = "primary" | "rose" | "secondary" | "ghost" | "soft";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-full font-bold tracking-tight transition-[transform,box-shadow,background-color,opacity] duration-200 ease-[var(--ease-soft)] active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "bg-cocoa text-cream shadow-[0_4px_0_0_#3c2d29,0_14px_24px_-12px_rgb(89_69_63/0.6)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#3c2d29,0_18px_28px_-12px_rgb(89_69_63/0.6)] active:shadow-[0_1px_0_0_#3c2d29]",
  rose:
    "bg-rosewood text-white shadow-[0_4px_0_0_#a4566f,0_14px_24px_-12px_rgb(201_113_140/0.7)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#a4566f,0_18px_28px_-12px_rgb(201_113_140/0.7)] active:shadow-[0_1px_0_0_#a4566f]",
  secondary:
    "bg-paper text-cocoa ring-1 ring-cocoa/15 shadow-[0_3px_0_0_rgb(89_69_63/0.14)] hover:-translate-y-0.5 hover:bg-white active:shadow-none",
  soft: "bg-blush text-cocoa hover:bg-[#f2cfda] shadow-[0_3px_0_0_#e3b5c4] active:shadow-none",
  ghost: "text-cocoa hover:bg-cocoa/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-base sm:text-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  silent?: boolean;
}

export function Button({ variant = "primary", size = "md", className = "", silent, onClick, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonClass(variant, size, className)}
      onClick={(e) => {
        if (!silent) sound.play("tap");
        onClick?.(e);
      }}
      {...rest}
    />
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({ variant = "primary", size = "md", className = "", onClick, ...rest }: ButtonLinkProps) {
  return (
    <Link
      className={buttonClass(variant, size, className)}
      onClick={(e) => {
        sound.play("tap");
        onClick?.(e);
      }}
      {...rest}
    />
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  active?: boolean;
  tone?: "paper" | "plain" | "danger";
  size?: "sm" | "md";
}

export function IconButton({ label, children, active, tone = "paper", size = "md", className = "", onClick, ...rest }: IconButtonProps) {
  const tones = {
    paper: active
      ? "bg-cocoa text-cream shadow-[0_2px_0_0_#3c2d29]"
      : "bg-paper text-cocoa ring-1 ring-cocoa/12 shadow-[0_2px_0_0_rgb(89_69_63/0.12)] hover:bg-white",
    plain: active ? "bg-cocoa/10 text-cocoa" : "text-cocoa hover:bg-cocoa/6",
    danger: "bg-paper text-[#b4475f] ring-1 ring-[#b4475f]/20 hover:bg-[#fdeef2]",
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-35 ${
        size === "sm" ? "h-9 w-9" : "h-11 w-11"
      } ${tones[tone]} ${className}`}
      onClick={(e) => {
        sound.play("tap");
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
