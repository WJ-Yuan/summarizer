import { createComponent } from "@lit/react"
import { MdFilledIconButton } from "@material/web/iconbutton/filled-icon-button"
import { MdFilledTonalIconButton } from "@material/web/iconbutton/filled-tonal-icon-button"
import { MdIconButton } from "@material/web/iconbutton/icon-button"
import { MdOutlinedIconButton } from "@material/web/iconbutton/outlined-icon-button"
import React from "react"

export const IconButton = createComponent({
  tagName: "md-icon-button",
  elementClass: MdIconButton,
  react: React,
  events: {
    onInput: "input",
    onChange: "change"
  }
})

export const FilledIconButton = createComponent({
  tagName: "md-filled-icon-button",
  elementClass: MdFilledIconButton,
  react: React,
  events: {
    onInput: "input",
    onChange: "change"
  }
})

export const FilledTonalIconButton = createComponent({
  tagName: "md-filled-tonal-icon-button",
  elementClass: MdFilledTonalIconButton,
  react: React,
  events: {
    onInput: "input",
    onChange: "change"
  }
})

export const OutlinedIconButton = createComponent({
  tagName: "md-outlined-icon-button",
  elementClass: MdOutlinedIconButton,
  react: React,
  events: {
    onInput: "input",
    onChange: "change"
  }
})
