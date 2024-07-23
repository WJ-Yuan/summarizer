import { createComponent } from "@lit/react"
import { MdSwitch } from "@material/web/switch/switch"
import React from "react"

export const Switch = createComponent({
  tagName: "md-switch",
  elementClass: MdSwitch,
  react: React,
  events: {
    onInput: "input",
    onChange: "change"
  }
})
