import { createComponent } from "@lit/react"
import { Snackbar } from "mdui/components/snackbar"
import { snackbar } from "mdui/functions/snackbar"
import React from "react"

export const SnackBar = createComponent({
  tagName: "mdui-snackbar",
  elementClass: Snackbar,
  react: React,
  events: {
    onOpen: "open",
    onOpened: "opened",
    onClose: "close",
    onClosed: "closed",
    onActionClick: "action-click"
  }
})

export const $snackbar = (
  message: string,
  extra: Omit<Parameters<typeof snackbar>[0], "message"> = {}
) =>
  snackbar({
    message,
    ...extra
  })
