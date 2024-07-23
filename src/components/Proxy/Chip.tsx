import { createComponent } from "@lit/react"
import { MdChipSet } from "@material/web/chips/chip-set"
import { MdInputChip } from "@material/web/chips/input-chip"
import React from "react"

export const InputChip = createComponent({
  tagName: "md-input-chip",
  elementClass: MdInputChip,
  react: React,
  events: {
    onRemove: "remove",
    onUpdateFocus: "update-focus"
  }
})

export const ChipSet = createComponent({
  tagName: "md-chip-set",
  elementClass: MdChipSet,
  react: React,
  events: {}
})
