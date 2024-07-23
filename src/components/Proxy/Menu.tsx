import { createComponent } from "@lit/react"
import { MdMenu } from "@material/web/menu/menu"
import { MdMenuItem } from "@material/web/menu/menu-item"
import { MdSubMenu } from "@material/web/menu/sub-menu"
import React from "react"

export const Menu = createComponent({
  tagName: "md-menu",
  elementClass: MdMenu,
  react: React,
  events: {
    onOpening: "opening",
    onOpened: "opened",
    onClosing: "closing",
    onClosed: "closed"
  }
})

export const MenuItem = createComponent({
  tagName: "md-menu-item",
  elementClass: MdMenuItem,
  react: React,
  events: {
    onCloseMenu: "close-menu",
    onClick: "click"
  }
})

export const SubMenu = createComponent({
  tagName: "md-sub-menu",
  elementClass: MdSubMenu,
  react: React,
  events: {}
})
