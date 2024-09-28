import TurndownService from "turndown"

declare const __DEV__: boolean
/** Extension name, defined in packageJson.name */
declare const __NAME__: string

declare global {
  interface Window {
    __summarizer_markdown?: string
    __summarizer_turndown?: typeof TurndownService
  }
}
