import fs from "fs-extra"
import type { Manifest } from "webextension-polyfill"
import type PkgType from "../package.json"
import { isDev, isFirefox, port, r } from "../scripts/utils"

export async function getManifest(): Promise<Manifest.WebExtensionManifest> {
  const pkg = (await fs.readJSON(r("package.json"))) as typeof PkgType // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: "__MSG_extension_name__",
    version: pkg.version,
    description: "__MSG_extension_description__",
    action: {
      default_icon: "./assets/icon-128.png",
      default_title: "__MSG_sidepanel_welcome_logo_title__"
    },
    options_ui: {
      page: "./dist/options/index.html",
      open_in_tab: true
    },
    background: isFirefox
      ? {
          scripts: ["dist/background/index.mjs"],
          type: "module"
        }
      : {
          service_worker: "./dist/background/index.mjs"
        },
    icons: {
      16: "./assets/icon-128.png",
      48: "./assets/icon-128.png",
      128: "./assets/icon-128.png"
    },
    permissions: [
      "tabs",
      "scripting",
      "storage",
      "activeTab",
      "sidePanel",
      "notifications",
      "contextMenus",
      "tts"
    ],
    commands: {
      _execute_action: {
        suggested_key: {
          default: "Ctrl+Shift+S",
          mac: "Command+Shift+S"
        }
      }
    },
    host_permissions: ["*://*/*"],
    web_accessible_resources: [
      {
        resources: [
          "dist/contentScripts/style.css",
          "dist/sidepanel/index.html"
        ],
        matches: ["<all_urls>"]
      }
    ],
    content_security_policy: {
      extension_pages: isDev
        ? `script-src \'self\' http://localhost:${port}; object-src \'self\'`
        : "script-src 'self'; object-src 'self'"
    },
    default_locale: "en"
  }

  // FIXME: not work in MV3
  // if (isDev && manifest.manifest_version <= 3) {
  //   // for content script, as browsers will cache them for each reload,
  //   // we use a background script to always inject the latest version
  //   // see src/background/contentScriptHMR.ts
  //   delete manifest.content_scripts
  //   manifest.permissions?.push("webNavigation")
  // }

  if (isFirefox) {
    manifest.sidebar_action = {
      default_title: "Summarizer",
      default_panel: "/dist/sidepanel/index.html",
      default_icon: "icon-128.png"
    }
  }

  return manifest
}
