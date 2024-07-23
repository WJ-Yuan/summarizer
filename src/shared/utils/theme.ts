import { storage } from "webextension-polyfill"
import { StorageKey } from "~/shared/constants"
import { applyThemeBody } from "~/shared/utils"

export const initTheme = async () => {
  const store = await storage.local.get({
    [StorageKey.ThemeBaseColor]: "#FFFFFF"
  })
  applyThemeBody(store[StorageKey.ThemeBaseColor])
}
