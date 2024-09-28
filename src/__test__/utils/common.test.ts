import { afterEach, describe, expect, it, vi, type Mock } from "vitest"
import { storage } from "webextension-polyfill"
import { StorageKey } from "~/shared/constants/common"
import { debounce, filterSensitiveInfo } from "~/shared/utils/common"

vi.mock("webextension-polyfill", () => ({
  storage: {
    local: {
      get: vi.fn()
    }
  }
}))

afterEach(() => {
  vi.resetAllMocks()
})

describe("debounce", () => {
  it("should debounce a function", async () => {
    vi.useFakeTimers()
    const func = vi.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    expect(func).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    debouncedFunc()
    expect(func).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it("should clear previous timeout when called again", async () => {
    vi.useFakeTimers()
    const func = vi.fn()
    const debouncedFunc = debounce(func, 100)

    debouncedFunc()
    vi.advanceTimersByTime(50)
    debouncedFunc()
    vi.advanceTimersByTime(100)
    expect(func).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})

describe("filterSensitiveInfo", () => {
  it("should filter sensitive information", async () => {
    ;(storage.local.get as Mock).mockResolvedValue({
      [StorageKey.SensitiveFilter]: [
        { sensitive: "password", replacement: "*****" },
        { sensitive: "secret", replacement: "*****" }
      ]
    })

    const result = await filterSensitiveInfo("my password is secret")
    expect(result).toBe("my ***** is *****")
  })

  it("should return empty string on error", async () => {
    const result = await filterSensitiveInfo("my password is secret")
    expect(result).toBe("")
  })
})
