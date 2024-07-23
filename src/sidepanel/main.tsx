import React from "react"
import { createRoot } from "react-dom/client"
import "~/styles"
import "~/styles/sidepanel.scss"
import "~/styles/typography.scss"
import { initTheme } from "~/shared/utils"
import App from "./SidePanel"

initTheme()

const container = document.getElementById("app")
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
