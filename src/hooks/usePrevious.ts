import {
  useEffect,
  useRef,
  type ComponentState,
  type PropsWithoutRef
} from "react"

export const usePrevious = <T>(value: PropsWithoutRef<T> | ComponentState) => {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
