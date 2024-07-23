import { createComponent } from "@lit/react"
import { NavigationDrawer } from "mdui/components/navigation-drawer"
import React from "react"

export const Drawer = createComponent({
  tagName: "mdui-navigation-drawer",
  elementClass: NavigationDrawer,
  react: React,
  events: {
    onOpen: "open",
    onOpened: "opened",
    onClose: "close",
    onClosed: "closed",
    onOverlayClick: "overlay-click"
  }
})
