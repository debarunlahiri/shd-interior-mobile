import { Appearance, StyleSheet } from "react-native";

export type AppColorScheme = "light" | "dark";

const lightColors = {
  background: "#F5F7F8",
  surface: "#FFFFFF",
  surfaceAlternate: "#FAFBFA",
  surfaceMuted: "#EEF2F3",
  ink: "#17201D",
  inkMuted: "#65706C",
  placeholder: "#969E9B",
  primary: "#173F35",
  primarySoft: "#E1ECE8",
  accent: "#D99B3C",
  accentSoft: "#F8EBD7",
  success: "#2B7A5C",
  danger: "#C9534B",
  dangerSoft: "#FBE9E7",
  warning: "#B36B16",
  border: "#E1E7E4",
  white: "#FFFFFE",
} as const;

const darkColors: Record<keyof typeof lightColors, string> = {
  background: "#0F1512",
  surface: "#18201C",
  surfaceAlternate: "#1D2722",
  surfaceMuted: "#222D28",
  ink: "#F1F6F3",
  inkMuted: "#AAB8B2",
  placeholder: "#83918B",
  primary: "#54B28F",
  primarySoft: "#203B32",
  accent: "#E7B45E",
  accentSoft: "#3B3020",
  success: "#64C99E",
  danger: "#FF8D83",
  dangerSoft: "#3D2422",
  warning: "#F0B35A",
  border: "#334039",
  white: "#FFFFFE",
};

export type ThemeColors = Record<keyof typeof lightColors, string>;

let activeScheme: AppColorScheme =
  Appearance.getColorScheme() === "dark" ? "dark" : "light";

const colorsObject = {} as ThemeColors;
for (const key of Object.keys(lightColors) as (keyof ThemeColors)[]) {
  Object.defineProperty(colorsObject, key, {
    enumerable: true,
    get: () => (activeScheme === "dark" ? darkColors[key] : lightColors[key]),
  });
}

export const colors = colorsObject;

type MutableStyle = Record<string, unknown>;
const colorKeys = Object.keys(lightColors) as (keyof ThemeColors)[];

function colorKeyFor(value: unknown) {
  if (typeof value !== "string") return undefined;
  return colorKeys.find(
    (key) => value === lightColors[key] || value === darkColors[key],
  );
}

const mutableStyleSheet = StyleSheet as unknown as {
  create: <T extends Record<string, MutableStyle>>(styles: T) => T;
};

mutableStyleSheet.create = <T extends Record<string, MutableStyle>>(
  styles: T,
) => {
  return new Proxy(styles, {
    get(target, property, receiver) {
      const style = Reflect.get(target, property, receiver) as
        MutableStyle | undefined;
      if (!style || typeof style !== "object") return style;
      const palette = activeScheme === "dark" ? darkColors : lightColors;
      return Object.fromEntries(
        Object.entries(style).map(([styleProperty, value]) => {
          const colorKey = colorKeyFor(value);
          return [styleProperty, colorKey ? palette[colorKey] : value];
        }),
      );
    },
  });
};

export function setActiveColorScheme(scheme: AppColorScheme) {
  if (scheme === activeScheme) return false;
  activeScheme = scheme;
  return true;
}

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};
