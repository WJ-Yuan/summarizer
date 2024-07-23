import { createComponent } from "@lit/react"
import { MdFab } from "@material/web/fab/fab"
import React from "react"

export const Fab = createComponent({
  tagName: "md-fab",
  elementClass: MdFab,
  react: React,
  events: {
    onClick: "click"
  }
})
