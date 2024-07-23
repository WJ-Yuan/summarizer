import { useState } from "react"
import { Fab, Icon, List, ListItem, Switch } from "~/components/Proxy"
import { useStorage, useThemeChange } from "~/hooks"
import { ResponseType, StorageKey } from "~/shared/constants"
import { $t } from "~/shared/utils"
import {
  GeminiApiKeyDialog,
  PromptDialog
} from "./components/Details/SettingDialog"
import AdvancedDrawer from "./components/Drawers/AdvancedDrawer"
import ForbiddenUrlDrawer from "./components/Drawers/ForbiddenUrlDrawer"
import SensitiveFilterDrawer from "./components/Drawers/SensitiveFilterDrawer"

enum DialogType {
  Prompt,
  GeminiApiKey,
  ForbiddenUrl,
  SensitiveFilter,
  Advanced
}

const Options = () => {
  const [responseType, setResponseType] = useStorage<ResponseType>(
    StorageKey.AIResponseType,
    ResponseType.Stream
  )
  const [prompt] = useStorage(StorageKey.SummaryPrompt)
  const [apiKey] = useStorage(StorageKey.GeminiAPIKey) // dialog open

  const [promptOpen, setPromptOpen] = useState(false)
  const [geminiApiKeyOpen, setGeminiApiKeyOpen] = useState(false)
  const [urlOpen, setUrlOpen] = useState(false)
  const [sensitiveOpen, setSensitiveOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const { colorRef, baseColor, openColorPanel, updateTheme } = useThemeChange()

  const handleResponseTypeChange = () => {
    setResponseType(
      responseType === ResponseType.Stream
        ? ResponseType.Json
        : ResponseType.Stream
    )
  }

  const openDialog = (type: DialogType) => {
    switch (type) {
      case DialogType.Prompt:
        setPromptOpen(true)
        break
      case DialogType.GeminiApiKey:
        setGeminiApiKeyOpen(true)
        break
      case DialogType.ForbiddenUrl:
        setUrlOpen(true)
        break
      case DialogType.SensitiveFilter:
        setSensitiveOpen(true)
        break
      case DialogType.Advanced:
        setAdvancedOpen(true)
        break
      default:
        break
    }
  }

  return (
    <>
      <div
        className="options body"
        aria-label={$t("options_form_header_description")}>
        <header className="options-header">
          <h1>
            <Icon aria-label={$t("options_form_header_icon_description")}>
              settings
            </Icon>
          </h1>
        </header>

        <main>
          <List>
            <ListItem>
              <h4>Response</h4>
            </ListItem>

            <ListItem
              tabIndex={0}
              type="button"
              aria-role="button"
              aria-label={$t("options_form_response_type_description")}
              onClick={handleResponseTypeChange}>
              <Icon slot="start">stream</Icon>
              <div slot="headline">
                {$t("options_form_response_type_header")}
              </div>
              <div slot="supporting-text">
                {responseType === ResponseType.Stream
                  ? $t("options_form_response_type_tips_stream")
                  : $t("options_form_response_type_tips_json")}
              </div>
              <Switch
                aria-label="stream response"
                slot="end"
                selected={responseType === ResponseType.Stream}
                value={
                  responseType === ResponseType.Stream
                    ? ResponseType.Json
                    : ResponseType.Stream
                }
              />
            </ListItem>
          </List>

          <List>
            <ListItem>
              <h4>Request</h4>
            </ListItem>

            <ListItem
              tabIndex={0}
              type="button"
              aria-role="button"
              aria-label={$t("options_form_summary_prompt_description")}
              onClick={() => openDialog(DialogType.Prompt)}>
              <Icon slot="start">text_fields</Icon>
              <div slot="headline">
                {$t("options_form_summary_prompt_header")}
              </div>
              <div slot="supporting-text">
                {prompt?.length
                  ? prompt.length > 30
                    ? `${prompt.slice(0, 25)}...`
                    : prompt
                  : $t("options_form_summary_prompt_tips")}
              </div>
            </ListItem>

            <ListItem
              tabIndex={0}
              type="button"
              aria-role="button"
              aria-label={$t("options_form_filter_description")}
              onClick={() => openDialog(DialogType.SensitiveFilter)}>
              <Icon slot="start">filter_alt</Icon>
              <div slot="headline">{$t("options_form_filter_header")}</div>
              <div slot="supporting-text">{$t("options_form_filter_tips")}</div>
            </ListItem>

            <ListItem
              tabIndex={0}
              type="button"
              aria-role="button"
              aria-label={$t("options_form_forbidden_url_description")}
              onClick={() => openDialog(DialogType.ForbiddenUrl)}>
              <Icon slot="start">dangerous</Icon>
              <div slot="headline">
                {$t("options_form_forbidden_url_header")}
              </div>
              <div slot="supporting-text">
                {$t("options_form_forbidden_url_tips")}
              </div>
            </ListItem>
          </List>

          <List>
            <ListItem>
              <h4>Gemini</h4>
            </ListItem>

            <ListItem
              tabIndex={0}
              type="button"
              aria-role="button"
              aria-label={$t("options_form_gemini_api_key_description")}
              onClick={() => openDialog(DialogType.GeminiApiKey)}>
              <Icon slot="start">key</Icon>
              <div slot="headline">
                {$t("options_form_gemini_api_key_header")}
              </div>
              <div slot="supporting-text">
                {apiKey
                  ? apiKey.slice(0, 5) + "*********" + apiKey.slice(-5)
                  : $t("options_form_gemini_api_key_tips")}
              </div>
            </ListItem>
          </List>

          <List>
            <ListItem aria-label="Gemini AI setting header">
              <h4>Advanced</h4>
            </ListItem>

            <ListItem
              tabIndex={0}
              type="button"
              aria-role="button"
              aria-label={$t("options_form_advanced_rule_description")}
              onClick={() => openDialog(DialogType.Advanced)}>
              <Icon slot="start">design_services</Icon>
              <div slot="headline">
                {$t("options_form_advanced_rule_header")}
              </div>
              <div slot="supporting-text">
                {$t("options_form_advanced_rule_tips")}
              </div>
            </ListItem>
          </List>
        </main>

        <aside className="theme">
          <Fab
            className="trigger"
            aria-color={$t("options_form_theme_description")}
            onClick={openColorPanel}>
            <Icon slot="icon">palette</Icon>
          </Fab>
          <input
            ref={colorRef}
            type="color"
            className="color"
            value={baseColor}
            onChange={updateTheme}
          />
        </aside>

        <ForbiddenUrlDrawer open={urlOpen} onSave={() => setUrlOpen(false)} />

        <SensitiveFilterDrawer
          open={sensitiveOpen}
          onSave={() => setSensitiveOpen(false)}
        />

        <AdvancedDrawer
          open={advancedOpen}
          onSave={() => setAdvancedOpen(false)}
        />
      </div>
      {promptOpen && <PromptDialog onSave={() => setPromptOpen(false)} />}
      {geminiApiKeyOpen && (
        <GeminiApiKeyDialog onSave={() => setGeminiApiKeyOpen(false)} />
      )}
    </>
  )
}

export default Options
