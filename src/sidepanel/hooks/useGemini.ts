import type { Chat } from "Common"
import { $snackbar } from "~/components/Proxy"
import {
  generateJsonAIContent,
  generateStreamAIContent,
  getRequestConfig,
  type RequestParams
} from "~/shared/api/gemini"
import {
  ChatRole,
  ChatStatus,
  EXTENSION_ERROR,
  ResponseType
} from "~/shared/constants"
import { $t } from "~/shared/utils"

export const useGemini = (
  setIsSuspendVisible: React.Dispatch<React.SetStateAction<boolean>>,
  setHistory: React.Dispatch<React.SetStateAction<Chat[]>>
) => {
  const generateStreamResponse = async (
    params: RequestParams,
    signal: AbortSignal
  ) => {
    const response = await generateStreamAIContent(params, signal)

    if (!response.ok) {
      const result = await response.json()
      if (result.error.code) {
        $snackbar(result.error.message)
        throw Error("")
      } else {
        throw Error(EXTENSION_ERROR.UNKNOWN_ERROR)
      }
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder("utf-8")
    let done = false
    let text = ""

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading

      if (doneReading) {
        setHistory((prev) => {
          return [
            ...prev.slice(0, prev.length - 1),
            {
              role: ChatRole.AI,
              content: text,
              status: ChatStatus.Done
            }
          ]
        })
        setIsSuspendVisible(false)
        break
      }

      const data = decoder.decode(value, { stream: !done })
      const chunkText = data.replace(/^data:\s*/, "")

      const json = JSON.parse(chunkText)

      if (json.candidates[0].content?.parts?.[0]?.text) {
        text += json.candidates[0].content.parts[0].text
        setHistory((prev) => {
          return [
            ...prev.slice(0, prev.length - 1),
            {
              role: ChatRole.AI,
              content: text,
              status: ChatStatus.Chatting
            }
          ]
        })
      } else if (!!json.candidates[0].finishReason) {
        $snackbar(
          $t("error_stop_with_finish_reason", [json.candidates[0].finishReason])
        )
        throw Error("")
      } else {
        throw Error(EXTENSION_ERROR.UNKNOWN_ERROR)
      }
    }
  }

  const generateJsonResponse = async (
    params: RequestParams,
    signal: AbortSignal
  ) => {
    const response = await generateJsonAIContent(params, signal)
    if (!response.ok) {
      const result = await response.json()
      throw Error(result)
    }
    const data = await response.json()

    if (data.candidates[0].content.parts[0].text) {
      const text = data.candidates[0].content.parts[0].text
      setHistory((prev) => {
        return [
          ...prev.slice(0, prev.length - 1),
          {
            role: ChatRole.AI,
            content: text,
            status: ChatStatus.Done
          }
        ]
      })
      setIsSuspendVisible(false)
    } else if (data.error.code) {
      $snackbar(data.error.message)
      throw Error("")
    } else {
      throw Error(EXTENSION_ERROR.UNKNOWN_ERROR)
    }
  }

  const generateGeminiResponse = async (
    role: ChatRole,
    content: string,
    signal: AbortSignal
  ) => {
    const params = await getRequestConfig(role, content)

    params.responseType === ResponseType.Stream
      ? await generateStreamResponse(params, signal)
      : await generateJsonResponse(params, signal)
  }

  return [generateGeminiResponse]
}
