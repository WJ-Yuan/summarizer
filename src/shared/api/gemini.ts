import {
  HarmBlockThreshold,
  HarmCategory,
  type GenerationConfig
} from "@google/generative-ai"
import browser from "webextension-polyfill"
import {
  BASE_URL,
  ChatRole,
  DEFAULT_PROMPT,
  EXTENSION_ERROR,
  ResponseType,
  StorageKey
} from "~/shared/constants"
import { $t } from "../utils"

export interface RequestParams {
  prompt: string
  apiKey: string
  modelName: string
  responseType: ResponseType
}

export const generateRequestUrl = (
  model: string,
  type: "streamGenerateContent" | "generateContent",
  version: string = "v1beta"
) => {
  return `${BASE_URL}/${version}/models/${model}:${type}`
}

const generateRequestParams = (prompt: string) => {
  const generationConfig: GenerationConfig = {
    temperature: 0.7,
    topP: 0.95
  }

  return {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
      }
    ]
  }
}

export const getRequestConfig = async (
  role: ChatRole,
  content: string,
  model: string = "gemini-1.5-flash"
): Promise<RequestParams> => {
  const storage = await browser.storage.local.get({
    [StorageKey.GeminiAPIKey]: "",
    [StorageKey.SummaryPrompt]: $t(DEFAULT_PROMPT),
    [StorageKey.AIResponseType]: ResponseType.Stream
  })

  const apiKey = storage[StorageKey.GeminiAPIKey]
  if (!apiKey) throw new Error(EXTENSION_ERROR.API_KEY_MISSING)

  const prompt =
    role === ChatRole.Summary
      ? storage[StorageKey.SummaryPrompt] + content
      : content

  return {
    prompt,
    apiKey,
    modelName: model,
    responseType: storage[StorageKey.AIResponseType]
  }
}

export const generateJsonAIContent = async (
  { apiKey, prompt, modelName }: RequestParams,
  signal: AbortSignal
) => {
  const baseUrl = generateRequestUrl(modelName, "generateContent")
  const params = generateRequestParams(prompt)

  return fetch(baseUrl, {
    method: "POST",
    headers: {
      "X-Goog-Api-Client": "genai-js/0.13.0",
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey
    },
    body: JSON.stringify(params),
    signal
  })
}

export const generateStreamAIContent = async (
  { apiKey, prompt, modelName }: RequestParams,
  signal: AbortSignal
) => {
  const baseUrl = generateRequestUrl(modelName, "streamGenerateContent")
  const params = generateRequestParams(prompt)

  return fetch(baseUrl + "?alt=sse", {
    method: "POST",
    headers: {
      "X-Goog-Api-Client": "genai-js/0.13.0",
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey
    },
    body: JSON.stringify(params),
    signal
  })
}
