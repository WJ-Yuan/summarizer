import { ChangeEventHandler, useEffect, useRef } from "react"
import { storage, type Storage } from "webextension-polyfill"
import { StorageKey } from "~/shared/constants"
import { applyThemeBody, debounce, initTheme } from "~/shared/utils"
import { useStorage } from "./useStorage"

export const useThemeChange = () => {
  const colorRef = useRef<HTMLInputElement>(null)
  const [baseColor, setBaseColor] = useStorage(
    StorageKey.ThemeBaseColor,
    "#FFFFFF"
  )

  useEffect(() => {
    const themeListener = (changes: {
      [key: string]: Storage.StorageChange
    }) => {
      if (Object.keys(changes).includes(StorageKey.ThemeBaseColor)) {
        initTheme()
      }
    }
    storage.onChanged.addListener(themeListener)

    return () => {
      storage.onChanged.removeListener(themeListener)
    }
  }, [])

  const openColorPanel = () => {
    colorRef.current?.click()
  }

  const debounceUpdateTheme = debounce(async (color: string) => {
    await setBaseColor(color)
    applyThemeBody(color)
  }, 100)

  const updateTheme: ChangeEventHandler = async (e) => {
    const color = (e.target as HTMLInputElement).value
    await debounceUpdateTheme(color)
  }

  return {
    colorRef,
    baseColor,
    openColorPanel,
    updateTheme
  }
}
