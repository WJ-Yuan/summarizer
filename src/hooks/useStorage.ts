import { useCallback, useEffect, useRef, useState } from "react"
import { storage, type Storage } from "webextension-polyfill"

type RawKey = string

export function useStorage<T = any>(rawKey: RawKey, onInit?: T) {
  const key = rawKey
  const [renderValue, setRenderValue] = useState<T | undefined>(onInit)
  const [isLoading, setIsLoading] = useState(true)
  const isMounted = useRef(false)
  const renderValueRef = useRef(renderValue)

  useEffect(() => {
    renderValueRef.current = renderValue
  }, [renderValue])

  const storageRef = useRef(storage.local)

  const setStoreValue = useCallback(
    (v: T) => storageRef.current.set({ [key]: v }),
    [key]
  )

  const persistValue = useCallback(
    async (value: T) => {
      await setStoreValue(value)
      if (isMounted.current) setRenderValue(value)
    },
    [setStoreValue]
  )

  useEffect(() => {
    isMounted.current = true

    const handleChange = (changes: {
      [key: string]: Storage.StorageChange
    }) => {
      if (changes[key] && isMounted.current) {
        setRenderValue(changes[key].newValue)
        setIsLoading(false)
      }
    }

    storage.onChanged.addListener(handleChange)

    storageRef.current.get(key).then((result) => {
      const value = result[key]
      setRenderValue(value !== undefined ? value : onInit)
      setIsLoading(false)
    })

    return () => {
      isMounted.current = false
      storage.onChanged.removeListener(handleChange)
      setRenderValue(onInit)
    }
  }, [key, onInit])

  const remove = useCallback(() => {
    storageRef.current.remove(key)
    setRenderValue(undefined)
  }, [key])

  return [
    renderValue,
    persistValue,
    {
      setRenderValue,
      setStoreValue,
      remove,
      isLoading
    }
  ] as const
}
