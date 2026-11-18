// @vitest-environment node
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const css = readFileSync(
  new URL("../../../../src/assets/styles/tokens.css", import.meta.url),
  "utf-8"
);

type Rgb = [number, number, number];

function readTokens(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf("}", start));
  const entries = [...body.matchAll(/--([\w-]+):\s*([\d.]+ [\d.]+% [\d.]+%);/g)];
  return Object.fromEntries(entries.map(([, name = "", value = ""]) => [name, value]));
}

const LIGHT = readTokens(":root");
const DARK = { ...LIGHT, ...readTokens(".app-dark") };

function hslToRgb(value: string): Rgb {
  const [hue = 0, saturation = 0, lightness = 0] = value
    .split(" ")
    .map((part) => Number.parseFloat(part));
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = s * Math.min(l, 1 - l);
  const channel = (offset: number): number => {
    const k = (offset + hue / 30) % 12;
    return l - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4)];
}

function blend(foreground: Rgb, background: Rgb, alpha: number): Rgb {
  return foreground.map(
    (channel, index) => alpha * channel + (1 - alpha) * (background[index] ?? 0)
  ) as Rgb;
}

function luminance([red, green, blue]: Rgb): number {
  const linear = (channel: number): number =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function contrast(first: Rgb, second: Rgb): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

function tokenColor(tokens: Record<string, string>, name: string): Rgb {
  const value = tokens[name];
  if (value === undefined) {
    throw new Error(`Missing token --${name}`);
  }
  return hslToRgb(value);
}

const AA_TEXT = 4.5;

const TEXT_PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["muted-foreground", "background"],
  ["muted-foreground", "card"],
  ["muted-foreground", "card-subtle"],
  ["muted-foreground", "muted"],
  ["secondary-foreground", "secondary"],
  ["sidebar-foreground", "sidebar"],
  ["sidebar-muted", "sidebar"],
  ["status-success-fg", "status-success-bg"],
  ["status-warning-fg", "status-warning-bg"],
  ["status-info-fg", "status-info-bg"],
  ["status-processing-fg", "status-processing-bg"],
];

describe("design tokens", () => {
  it("overrides every colour token for dark mode", () => {
    expect(Object.keys(readTokens(".app-dark")).sort()).toEqual(Object.keys(LIGHT).sort());
  });

  describe.each([
    ["light", LIGHT],
    ["dark", DARK],
  ])("%s theme", (_theme, tokens) => {
    it.each(TEXT_PAIRS)("%s on %s meets WCAG AA", (text, background) => {
      expect(
        contrast(tokenColor(tokens, text), tokenColor(tokens, background))
      ).toBeGreaterThanOrEqual(AA_TEXT);
    });
  });

  describe("light theme brand red", () => {
    it.each([
      ["primary-foreground", "primary"],
      ["primary", "card"],
      ["primary", "background"],
    ])("%s on %s meets WCAG AA", (text, background) => {
      expect(
        contrast(tokenColor(LIGHT, text), tokenColor(LIGHT, background))
      ).toBeGreaterThanOrEqual(AA_TEXT);
    });

    it.each(["card", "card-subtle", "background"])(
      "text on the primary/10 tint over %s uses primary-hover to meet AA",
      (base) => {
        const tint = blend(tokenColor(LIGHT, "primary"), tokenColor(LIGHT, base), 0.1);
        expect(contrast(tokenColor(LIGHT, "primary-hover"), tint)).toBeGreaterThanOrEqual(AA_TEXT);
      }
    );
  });
});
