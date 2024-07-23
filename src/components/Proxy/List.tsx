import { createComponent } from "@lit/react"
import { MdList } from "@material/web/list/list"
import { MdListItem } from "@material/web/list/list-item"
import React from "react"

export const List = createComponent({
  tagName: "md-list",
  elementClass: MdList,
  react: React,
  events: {
    onClick: "click"
  }
})

export const ListItem = createComponent({
  tagName: "md-list-item",
  elementClass: MdListItem,
  react: React,
  events: {
    onClick: "click"
  }
})
