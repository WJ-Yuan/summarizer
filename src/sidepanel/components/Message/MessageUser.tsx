import { memo } from "react"
import { FilledIconButton, Icon } from "~/components/Proxy"
import { $t } from "~/shared/utils"

const MessageUser = ({ content }: { content: string }) => {
  return (
    <section
      className="flex"
      aria-label={$t("sidepanel_chat_user_content_description")}>
      <FilledIconButton>
        <Icon>face</Icon>
      </FilledIconButton>
      <p className="ml-18"> {content}</p>
    </section>
  )
}

export default memo(MessageUser)
