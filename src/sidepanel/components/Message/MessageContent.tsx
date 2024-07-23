import type { Chat } from "Common"
import { memo, useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import { ChatRole, ChatStatus } from "~/shared/constants"
import MessageAction from "./MessageAction"

const MessageMarkdown = memo(({ renderContent }: { renderContent: string }) => {
  return (
    <Markdown
      className="md-prose"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        table: ({ node, ...props }) => (
          <table className="md-table" {...props}></table>
        )
      }}>
      {renderContent}
    </Markdown>
  )
})

const MessageContent = ({
  chat,
  index,
  onRegenerate
}: {
  chat: Chat
  index: number
  onRegenerate: (...args: any[]) => any
}) => {
  const { role, content, status = ChatStatus.Done } = chat

  const [renderContent, setRenderContent] = useState<string>("")
  const indexRef = useRef<number>(0)
  const rqaRef = useRef<number>()

  useEffect(() => {
    function clearRqa() {
      rqaRef.current && cancelAnimationFrame(rqaRef.current)
      rqaRef.current = undefined
    }

    function displayNextCharacters() {
      clearRqa()
      const index = indexRef.current

      if (index < content.length) {
        const nextContent = content.slice(index, index + 4)

        indexRef.current += nextContent.length
        setRenderContent((prev) => prev + nextContent)
        rqaRef.current = requestAnimationFrame(displayNextCharacters)
      }
    }

    if (status === ChatStatus.Suspend) {
      clearRqa()
    } else if (status === ChatStatus.Done) {
      clearRqa()
      setRenderContent(content)
      indexRef.current = content.length
    } else {
      displayNextCharacters()
    }
  }, [content, status])

  const isSuspend = status === ChatStatus.Suspend
  const isDone =
    status === ChatStatus.Done && renderContent.length === content.length

  return (
    <>
      <MessageMarkdown renderContent={renderContent} />
      {role === ChatRole.AI && !!content.length && (isSuspend || isDone) && (
        <MessageAction
          index={index}
          content={renderContent}
          onRegenerate={() => onRegenerate(index)}
        />
      )}
    </>
  )
}

export default MessageContent
