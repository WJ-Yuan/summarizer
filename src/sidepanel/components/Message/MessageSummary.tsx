import { memo } from "react"
import { FilledIconButton, Icon } from "~/components/Proxy"
import { $t } from "~/shared/utils"

const MessageSummary = () => {
  return (
    <h2
      className="summary"
      aria-label={$t("sidepanel_chat_summary_description")}>
      <FilledIconButton
        aria-label={$t("sidepanel_chat_summary_icon_description")}>
        <Icon>smart_toy</Icon>
      </FilledIconButton>

      <span className="ml-18">{$t("sidepanel_chat_summary_title")}</span>
    </h2>
  )
}

export default memo(MessageSummary)
