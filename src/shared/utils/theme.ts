import {
  applyTheme,
  argbFromHex,
  hexFromArgb,
  Theme,
  themeFromSourceColor
} from "@material/material-color-utilities"
import { storage } from "webextension-polyfill"
import { StorageKey } from "~/shared/constants"

export function applySurfaceStyles(
  theme: Theme,
  { dark }: { dark: boolean }
): void {
  if (dark) {
    const elevationProps = {
      "--md-sys-color-surface-dim": theme.palettes.neutral.tone(6),
      "--md-sys-color-surface-bright": theme.palettes.neutral.tone(24),
      "--md-sys-color-surface-container-lowest": theme.palettes.neutral.tone(4),
      "--md-sys-color-surface-container-low": theme.palettes.neutral.tone(10),
      "--md-sys-color-surface-container": theme.palettes.neutral.tone(12),
      "--md-sys-color-surface-container-high": theme.palettes.neutral.tone(17),
      "--md-sys-color-surface-container-highest":
        theme.palettes.neutral.tone(22)
    }

    for (const [property, argbColor] of Object.entries(elevationProps)) {
      document.body.style.setProperty(property, hexFromArgb(argbColor))
    }
  } else {
    const elevationProps = {
      "--md-sys-color-surface-dim": theme.palettes.neutral.tone(87),
      "--md-sys-color-surface-bright": theme.palettes.neutral.tone(98),
      "--md-sys-color-surface-container-lowest":
        theme.palettes.neutral.tone(100),
      "--md-sys-color-surface-container-low": theme.palettes.neutral.tone(96),
      "--md-sys-color-surface-container": theme.palettes.neutral.tone(94),
      "--md-sys-color-surface-container-high": theme.palettes.neutral.tone(92),
      "--md-sys-color-surface-container-highest":
        theme.palettes.neutral.tone(90)
    }

    for (const [property, argbColor] of Object.entries(elevationProps)) {
      document.body.style.setProperty(property, hexFromArgb(argbColor))
    }
  }
}

export const applyThemeBody = (color: string) => {
  const argbColor = argbFromHex(color)
  const theme = themeFromSourceColor(argbColor, [
    {
      name: "custom-1",
      value: argbColor,
      blend: true
    }
  ])

  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches

  applyTheme(theme, { target: document.body, dark: systemDark })
  applySurfaceStyles(theme, { dark: systemDark })
}

export const initTheme = async () => {
  const store = await storage.local.get({
    [StorageKey.ThemeBaseColor]: "#FFFFFF"
  })
  applyThemeBody(store[StorageKey.ThemeBaseColor])
}
