export const DEFAULT_PROMPT = "common_default_prompt"

export const MAX_PROMPT_LENGTH = 500

export enum StorageKey {
  AIResponseType = "response-type",
  SummaryPrompt = "summary-prompt",
  GeminiAPIKey = "gemini-api-key",
  ThemeBaseColor = "theme-base-color",
  SensitiveFilter = "sensitive-filter",
  ForbiddenUrl = "forbidden-url",
  AdvancedRule = "advanced-rule"
}

export enum ResponseType {
  Stream = "stream",
  Json = "json"
}

export enum ChatRole {
  Summary = "summary",
  User = "user",
  AI = "AI"
}

export enum TabStatus {
  Loading = "loading",
  Complete = "complete"
}

export enum ChatStatus {
  Loading = "loading",
  Chatting = "chatting",
  Done = "done",
  Suspend = "suspend"
}

export enum DrawerDialogType {
  Add = "add",
  Edit = "edit",
  Delete = "delete"
}
