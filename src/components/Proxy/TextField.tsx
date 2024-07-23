import { createComponent } from "@lit/react"
import { MdFilledTextField } from "@material/web/textfield/filled-text-field"
import { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field"
import React from "react"

export const FilledTextField = createComponent({
  tagName: "md-filled-text-field",
  elementClass: MdFilledTextField,
  react: React,
  events: {
    onSelect: "select",
    onChange: "change",
    onInput: "input"
  }
})

export const OutlinedTextField = createComponent({
  tagName: "md-outlined-text-field",
  elementClass: MdOutlinedTextField,
  react: React,
  events: {
    onSelect: "select",
    onChange: "change",
    onInput: "input"
  }
})
