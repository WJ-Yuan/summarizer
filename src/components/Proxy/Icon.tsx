import { createComponent } from "@lit/react"
import { MdIcon } from "@material/web/icon/icon"
import React from "react"

export const Icon = createComponent({
  tagName: "md-icon",
  elementClass: MdIcon,
  react: React,
  events: {
    onClick: "click"
  }
})
