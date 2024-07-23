import { createComponent } from "@lit/react"
import { MdDialog } from "@material/web/dialog/dialog"
import React from "react"

export const Dialog = createComponent({
  tagName: "md-dialog",
  elementClass: MdDialog,
  react: React,
  events: {
    onClick: "click",
    onOpen: "open",
    onOpened: "opened",
    onClose: "close",
    onClosed: "closed",
    onCancel: "cancel"
  }
})
