import type { DialogProps } from "Common"
import { Dialog, TextButton } from "../Proxy"
import "~/styles/removeDialog.scss"
import { $t } from "~/shared/utils"

interface RemoveDialogProps extends Required<Pick<DialogProps, "open">> {
  header?: string
  title?: string
  detail?: string
  onCancel: (...args: any[]) => void
  onConfirm: (...args: any[]) => void
}

const RemoveDialog = (props: RemoveDialogProps) => {
  const { header, open, title, detail, onConfirm, onCancel } = props

  return (
    <Dialog className="remove" open={open} noFocusTrap onClosed={onCancel}>
      <header slot="headline">
        <h2 className="header">
          {header || $t("common_components_remove_dialog_default_header")}
        </h2>
      </header>
      <main slot="content">
        {title && <h2 className="title">{title}</h2>}
        {detail && <p className="detail">{detail}</p>}
      </main>
      <footer slot="actions">
        <TextButton onClick={onCancel}>{$t("common_action_cancel")}</TextButton>
        <TextButton onClick={onConfirm}>
          {$t("common_action_confirm")}
        </TextButton>
      </footer>
    </Dialog>
  )
}

export default RemoveDialog
