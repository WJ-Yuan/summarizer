import React from "react"
import { createRoot } from "react-dom/client"
import Options from "./Options"
import "~/styles"
import "~/styles/options.scss"
import { initTheme } from "~/shared/utils"

initTheme()

const container = document.getElementById("app")
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
)
