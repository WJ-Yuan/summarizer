export enum MESSAGE_EVENT {
  SUMMARIZE_CONTEXT = "summarize-context",
  PANEL_MOUNT = "panel-mount",
  CREATE_SUMMARY = "create-summary",
  PANEL_ALIVE_CHECK = "side-panel-opened",
  START_TTS = "start-tts",
  STOP_TTS = "stop-tts"
}

export enum MESSAGE_SOURCE {
  SCRIPT = "content-script",
  BACKGROUND = "background",
  OPTIONS = "options",
  SIDEPANEL = "side-panel"
}
