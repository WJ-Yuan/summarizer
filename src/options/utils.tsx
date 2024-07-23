import type { Validation } from "Common"
import { $snackbar } from "~/components/Proxy"
import { $t, readFile } from "~/shared/utils"

export const removeDuplicates = <T extends Record<string, any>>(
  arr: T[],
  key: string
): T[] => {
  const seen = new Set<string>([])

  return arr.filter((item) => {
    const val = item[key]
    if (seen.has(val)) {
      return false
    } else {
      seen.add(val)
      return true
    }
  })
}

export const parseFile = async <T extends Record<string, any>, K>(
  file: File,
  primaryKey: string,
  cols: string[],
  storageData: T[],
  validator: (row: T, storageData: T[]) => Validation<string>
): Promise<T[]> => {
  try {
    const text = await readFile(file)
    const data = JSON.parse(text)
    if (!data.data || !Array.isArray(data.data)) {
      $snackbar($t("options_import_error_incorrect_format"))
      return []
    }

    const washedData: T[] = []
    data.data.forEach((item: T) => {
      const validation = validator({ ...item, id: NaN }, storageData)
      if (validation.isValid) {
        const newItem: Record<string, any> = {}
        cols.forEach((col) => {
          newItem[col] = (item[col] || "").trim()
        })
        washedData.push({ ...item })
      }
    })

    const legalData = removeDuplicates(washedData, primaryKey)
    const total = data.data.length
    const legal = legalData.length

    $snackbar(
      $t("options_import_info_finished", [`${legal}`, `${total - legal}`])
    )
    return legalData
  } catch {
    $snackbar($t("options_import_error_read_failed"))
    return []
  }
}
