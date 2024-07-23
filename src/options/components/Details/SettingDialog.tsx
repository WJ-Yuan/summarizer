import type { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field"
import type {
  DialogProps,
  DrawerDialogProps,
  Filter,
  ForbiddenUrl,
  Validator
} from "Common"
import { useRef, useState } from "react"
import {
  Dialog,
  FilledButton,
  Icon,
  OutlinedTextField,
  TextButton
} from "~/components/Proxy"
import { useStorage } from "~/hooks"
import {
  DEFAULT_PROMPT,
  DrawerDialogType,
  MAX_PROMPT_LENGTH,
  StorageKey
} from "~/shared/constants"
import {
  $t,
  isApiKeyValid,
  isForbiddenUrlValid,
  isPromptValid,
  isSensitiveFilterValid
} from "~/shared/utils"

export const PromptDialog = ({ onSave }: DialogProps) => {
  const [prompt, _, { setRenderValue, setStoreValue }] = useStorage(
    StorageKey.SummaryPrompt,
    $t(DEFAULT_PROMPT)
  )
  const [error, setError] = useState<Validator>({
    isError: false,
    errorMsg: ""
  })
  const formRef = useRef<MdOutlinedTextField>(null)

  const handleSaveClick = async () => {
    const validation = isPromptValid(prompt || "")

    setError({
      isError: !validation.isValid,
      errorMsg: $t(validation.errorMsg || "")
    })
    if (!validation.isValid) {
      formRef.current?.focus()
      return
    }

    await setStoreValue((prompt || "").trim())
    onSave()
  }

  const handleResetClick = () => {
    setRenderValue($t(DEFAULT_PROMPT))
  }

  const handleClosed = () => {
    onSave()
  }

  return (
    <Dialog open onClosed={handleClosed}>
      <div slot="headline" className="headline">
        <Icon>text_fields</Icon>
      </div>

      <form slot="content">
        <OutlinedTextField
          ref={formRef}
          name="prompt"
          type="textarea"
          rows={5}
          maxLength={MAX_PROMPT_LENGTH}
          label={$t("options_form_summary_prompt_header")}
          value={prompt}
          error={error.isError}
          errorText={error.errorMsg}
          onChange={(e) => {
            setRenderValue((e.target as HTMLInputElement).value)
          }}
        />
      </form>

      <footer slot="actions">
        <TextButton onClick={handleResetClick}>
          {$t("common_action_reset")}
        </TextButton>
        <FilledButton onClick={handleSaveClick}>
          {$t("common_action_save")}
        </FilledButton>
      </footer>
    </Dialog>
  )
}

export const GeminiApiKeyDialog = ({ onSave }: DialogProps) => {
  const [apiKey, _, { setRenderValue, setStoreValue }] = useStorage(
    StorageKey.GeminiAPIKey,
    ""
  )
  const [error, setError] = useState<Validator>({
    isError: false,
    errorMsg: ""
  })
  const formRef = useRef<MdOutlinedTextField>(null)

  const handleSaveClick = async () => {
    const validation = isApiKeyValid(apiKey || "")
    setError({
      isError: !validation.isValid,
      errorMsg: $t(validation.errorMsg || "")
    })

    if (!validation.isValid) {
      formRef.current?.focus()
      return
    }

    await setStoreValue((apiKey || "").trim())
    onSave()
  }

  const handleClosed = () => {
    onSave()
  }

  return (
    <>
      <Dialog open onClosed={handleClosed}>
        <div slot="headline" className="headline">
          <Icon>key</Icon>
        </div>

        <form slot="content">
          <OutlinedTextField
            name="apiKey"
            ref={formRef}
            error={error.isError}
            errorText={error.errorMsg}
            label={$t("options_form_gemini_api_key_header")}
            value={apiKey}
            onChange={(e) => {
              setRenderValue((e.target as HTMLInputElement).value)
            }}
          />
        </form>

        <div slot="actions">
          <TextButton onClick={handleClosed}>
            {$t("common_action_cancel")}
          </TextButton>

          <FilledButton onClick={handleSaveClick}>
            {$t("common_action_save")}
          </FilledButton>
        </div>
      </Dialog>
    </>
  )
}

export const ForbiddenUrlDialog = (props: DrawerDialogProps<ForbiddenUrl>) => {
  const { type, row, onSave, onClose } = props
  const [renderValue, setStoreValue] = useStorage<string[]>(
    StorageKey.ForbiddenUrl
  )
  const [url, setUrl] = useState<string>(row.url)
  const [error, setError] = useState<Validator>({
    isError: false,
    errorMsg: ""
  })
  const formRef = useRef<MdOutlinedTextField>(null)

  const handleSaveClick = () => {
    const validation = isForbiddenUrlValid(
      { url, id: row.id },
      (renderValue || []).map((u, index) => ({
        url: u,
        id: index
      }))
    )

    setError({
      isError: !validation.isValid,
      errorMsg: $t(validation.errorMsg || "")
    })
    if (!validation.isValid) {
      formRef.current?.focus()
      return
    }

    const washedUrl = url.trim()

    const final =
      type === DrawerDialogType.Add
        ? [washedUrl, ...(renderValue || [])]
        : (renderValue || []).map((r, index) =>
            index === props.row.id ? washedUrl : r
          )
    setStoreValue([...final])
    onSave()
  }

  return (
    <Dialog open onClosed={onClose}>
      <div slot="headline" className="headline">
        <Icon>dangerous</Icon>
      </div>

      <form slot="content">
        <OutlinedTextField
          ref={formRef}
          error={error.isError}
          errorText={error.errorMsg}
          label={$t("options_form_forbidden_url_header")}
          placeholder={$t("options_forbidden_url_tips")}
          value={url}
          onChange={(e) => {
            setUrl((e.target as MdOutlinedTextField).value)
          }}
        />
      </form>

      <footer slot="actions">
        <TextButton onClick={onClose}>{$t("common_action_cancel")}</TextButton>
        <FilledButton onClick={handleSaveClick}>
          {$t("common_action_save")}
        </FilledButton>
      </footer>
    </Dialog>
  )
}

export const SensitiveFilterDialog = (props: DrawerDialogProps<Filter>) => {
  const { row, type, onSave, onClose } = props
  const [renderValue, setStoreValue] = useStorage<Filter[]>(
    StorageKey.SensitiveFilter
  )
  const [filter, setFilter] = useState<Filter>({
    replacement: row.replacement,
    sensitive: row.sensitive
  })
  const [error, setError] = useState<Validator>({
    isError: false,
    errorMsg: ""
  })
  const formRef = useRef<MdOutlinedTextField>(null)

  const handleSaveClick = () => {
    const validation = isSensitiveFilterValid(
      { ...filter, id: row.id },
      renderValue || []
    )

    setError({
      isError: !validation.isValid,
      errorMsg: $t(validation.errorMsg || "")
    })
    if (!validation.isValid) {
      formRef.current?.focus()
      return
    }

    const washedFilter: Filter = {
      sensitive: filter.sensitive.trim(),
      replacement: filter.replacement.trim()
    }

    const final =
      type === DrawerDialogType.Add
        ? [washedFilter, ...(renderValue || [])]
        : (renderValue || []).map((r, index) =>
            r.sensitive === props.row.sensitive ? washedFilter : r
          )
    setStoreValue([...final])
    onSave()
  }

  return (
    <Dialog open onClosed={onClose}>
      <div slot="headline" className="headline">
        <Icon>dangerous</Icon>
      </div>

      <form slot="content">
        <OutlinedTextField
          ref={formRef}
          className="mb-16"
          error={error.isError}
          errorText={error.errorMsg}
          value={filter.sensitive}
          label={$t("options_filter_sensitive_label")}
          placeholder={$t("options_filter_sensitive_tips")}
          onChange={(e) => {
            setFilter((prev) => ({
              ...prev,
              sensitive: (e.target as MdOutlinedTextField).value
            }))
          }}>
          <Icon slot="leading-icon">sentiment_stressed</Icon>
        </OutlinedTextField>

        <OutlinedTextField
          value={filter.replacement}
          label={$t("options_filter_replacement_label")}
          placeholder={$t("options_filter_replacement_tips")}
          onChange={(e) => {
            setFilter((prev) => ({
              ...prev,
              replacement: (e.target as MdOutlinedTextField).value
            }))
          }}>
          <Icon slot="leading-icon">sentiment_content</Icon>
        </OutlinedTextField>
      </form>

      <footer slot="actions">
        <TextButton onClick={onClose}> {$t("common_action_cancel")}</TextButton>
        <FilledButton onClick={handleSaveClick}>
          {$t("common_action_save")}
        </FilledButton>
      </footer>
    </Dialog>
  )
}
