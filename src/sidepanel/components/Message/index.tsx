import type { Chat } from "Common"
import Skeleton from "~/components/Skeleton"
import { ChatRole, ChatStatus } from "~/shared/constants"
import MessageContent from "./MessageContent"
import MessageSummary from "./MessageSummary"
import MessageUser from "./MessageUser"

const MessageSection = ({
  index,
  chat,
  onRegenerate
}: {
  index: number
  chat: Chat
  onRegenerate: (...args: any[]) => any
}) => {
  const { role, content, status = ChatStatus.Done } = chat

  switch (role) {
    case ChatRole.Summary: {
      return <MessageSummary />
    }
    case ChatRole.User: {
      return <MessageUser content={content} />
    }
    case ChatRole.AI: {
      return (
        <>
          {status === ChatStatus.Loading ? (
            <Skeleton />
          ) : (
            <MessageContent
              chat={chat}
              index={index}
              onRegenerate={onRegenerate}
            />
          )}
        </>
      )
    }
    default: {
      return <div>Error</div>
    }
  }
}

export default MessageSection
