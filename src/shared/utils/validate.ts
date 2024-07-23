import type { Advanced, Filter, ForbiddenUrl, Validation } from "Common"
import { storage } from "webextension-polyfill"
import { isForbiddenUrl as isInternalForbiddenUrl } from "~/env"
import { StorageKey } from "../constants"

enum ValidationErrorMsg {
  EMPTY = "error_empty",
  ILLEGAL_FORMAT = "error_illegal_format",
  DUPLICATE = "error_duplicate",
  TOO_SHORT = "error_too_short"
}

export const isUrlFitRule = (rule: string, url: string) => {
  try {
    const inputURL = new URL(url).href
    if (rule.startsWith("R:")) {
      const regexPattern = rule.replace("R:", "")
      const regex = new RegExp(regexPattern)
      return regex.test(url)
    } else {
      const ruleURL = new URL(rule).href
      return ruleURL === inputURL
    }
  } catch {
    return false
  }
}

export const isEmpty = <K extends string>(
  value: string,
  errorKey: K
): Validation<K> => {
  if (!value.trim().length) {
    return {
      isValid: false,
      errorKey,
      errorMsg: ValidationErrorMsg.EMPTY
    }
  }
  return { isValid: true }
}

export const isDuplicate = <T, K extends string>(
  value: string,
  id: number,
  storageData: T[],
  getValue: (item: T) => string,
  errorKey: K
): Validation<K> => {
  if (
    storageData.some(
      (item, index) => getValue(item).trim() === value.trim() && id !== index
    )
  ) {
    return {
      isValid: false,
      errorKey,
      errorMsg: ValidationErrorMsg.DUPLICATE
    }
  }
  return { isValid: true }
}

export const isShort = <K extends string>(
  value: string,
  minLength: number,
  errorKey: K
): Validation<K> => {
  if (value.trim().length <= minLength) {
    return {
      isValid: false,
      errorKey,
      errorMsg: ValidationErrorMsg.TOO_SHORT
    }
  }
  return { isValid: true }
}

export const isIllegalUrlFormat = (url: string) => {
  if (url.startsWith("R:")) {
    try {
      new RegExp(url.replace("R:", ""))
      return true
    } catch {
      return false
    }
  } else {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

export const isUrlLegal = <K extends string>(
  url: string,
  errorKey: K
): Validation<K> => {
  if (!isIllegalUrlFormat(url.trim())) {
    return {
      isValid: false,
      errorKey,
      errorMsg: ValidationErrorMsg.ILLEGAL_FORMAT
    }
  }
  return { isValid: true }
}

export const isUrlValid = (
  url: string,
  id: number,
  storageData: ForbiddenUrl[]
): Validation<"url"> => {
  let validation = isEmpty(url, "url")
  if (!validation.isValid) return validation

  validation = isUrlLegal(url, "url")
  if (!validation.isValid) return validation

  validation = isDuplicate(url, id, storageData, (u) => u.url, "url")
  return validation
}

export const isSensitiveValid = (
  sensitive: string,
  id: number,
  storageData: Filter[]
): Validation<"sensitive"> => {
  let validation = isEmpty(sensitive, "sensitive")
  if (!validation.isValid) return validation

  validation = isDuplicate(
    sensitive,
    id,
    storageData,
    (f) => f.sensitive,
    "sensitive"
  )
  return validation
}

export const isJsValid = (javascript: string): Validation<"javascript"> => {
  return isEmpty(javascript, "javascript")
}

export const isForbiddenUrlValid = (
  row: ForbiddenUrl,
  storageData: ForbiddenUrl[]
): Validation<"url"> => {
  const { url = "", id = NaN } = row
  return isUrlValid(url, id, storageData)
}

export const isSensitiveFilterValid = (
  row: Filter,
  storageData: Filter[]
): Validation<"sensitive"> => {
  const { sensitive = "", id = NaN } = row
  return isSensitiveValid(sensitive, id, storageData)
}

export const isAdvancedRuleValid = (
  row: Advanced,
  storageData: Advanced[]
): Validation<"url" | "javascript"> => {
  const { url = "", javascript = "", id = NaN } = row

  const urlValidation = isUrlValid(
    url,
    id,
    storageData.map((r) => ({ url: r.url, id: r.id }))
  )
  if (!urlValidation.isValid) return urlValidation

  return isJsValid(javascript)
}

export const isApiKeyValid = (apiKey: string): Validation<"apiKey"> => {
  let validation = isEmpty(apiKey, "apiKey")
  if (!validation.isValid) return validation

  validation = isShort(apiKey, 10, "apiKey")
  return validation
}

export const isPromptValid = (prompt: string): Validation<"prompt"> => {
  return isEmpty(prompt, "prompt")
}

export const isForbiddenUrl = async (url: string): Promise<boolean> => {
  try {
    if (!url.length) {
      return true
    } else if (isInternalForbiddenUrl(url)) {
      return true
    }

    const _storage = await storage.local.get({
      [StorageKey.ForbiddenUrl]: []
    })
    const urls = _storage[StorageKey.ForbiddenUrl]
    return urls.some((u: string) => isUrlFitRule(u, url))
  } catch {
    return false
  }
}
