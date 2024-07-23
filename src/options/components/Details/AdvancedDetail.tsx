import { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field"
import type { Advanced, DrawerDialogProps, Validator } from "Common"
import { useEffect, useRef, useState } from "react"
import CodeMirror from "~/components/CodeMirror"
import {
  FilledButton,
  Icon,
  OutlinedButton,
  OutlinedTextField,
  TextButton
} from "~/components/Proxy"
import { useStorage } from "~/hooks"
import { DrawerDialogType, StorageKey } from "~/shared/constants"
import { $t, isAdvancedRuleValid } from "~/shared/utils"

const AdvancedDetail = (props: DrawerDialogProps<Advanced>) => {
  const { type, row, onSave, onClose: onCancel } = props
  const [tableData, setTableData] = useStorage<Advanced[]>(
    StorageKey.AdvancedRule
  )
  const [rule, setRule] = useState<Advanced>({
    url: row.url,
    javascript: row.javascript
  })
  const [error, setError] = useState<
    Record<keyof Omit<Advanced, "id">, Validator>
  >({
    url: {
      isError: false,
      errorMsg: ""
    },
    javascript: {
      isError: false,
      errorMsg: ""
    }
  })
  const urlRef = useRef<MdOutlinedTextField>(null)
  const jsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    init()
    const rqa = requestAnimationFrame(() => {
      urlRef.current?.focus()
    })

    return () => {
      cancelAnimationFrame(rqa)
    }
  }, [])

  const init = () => {
    setError({
      javascript: {
        isError: false,
        errorMsg: ""
      },
      url: {
        isError: false,
        errorMsg: ""
      }
    })
  }

  const handleSaveClick = (e: Event) => {
    e.preventDefault()

    const validation = isAdvancedRuleValid(
      { ...rule, id: row.id },
      tableData || []
    )
    if (!validation.isValid) {
      setError({
        url: {
          isError: validation.errorKey === "url",
          errorMsg:
            validation.errorKey === "url" ? $t(validation.errorMsg!) : ""
        },
        javascript: {
          isError: validation.errorKey === "javascript",
          errorMsg:
            validation.errorKey === "javascript" ? $t(validation.errorMsg!) : ""
        }
      })

      validation.errorKey === "url"
        ? urlRef.current?.focus()
        : jsRef.current?.focus()
      return
    }
    setError({
      javascript: {
        isError: false,
        errorMsg: ""
      },
      url: {
        isError: false,
        errorMsg: ""
      }
    })

    const washedRule: Advanced = {
      url: rule.url.trim(),
      javascript: rule.javascript.trim()
    }

    const final =
      type === DrawerDialogType.Add
        ? [washedRule, ...(tableData || [])]
        : (tableData || []).map((r, _) =>
            r.url === props.row.url ? washedRule : r
          )
    setTableData([...final])
    onSave()
  }

  return (
    <>
      <form className="form">
        <ul className="form-list">
          <li className="form-item">
            <OutlinedTextField
              ref={urlRef}
              name="url"
              label="URL"
              className="form-control w-100"
              supportingText={$t("options_advanced_rule_url_tips")}
              error={error.url.isError}
              errorText={error.url.errorMsg}
              value={rule.url}
              onChange={(e) =>
                setRule((prev) => ({
                  ...prev,
                  url: (e.target as MdOutlinedTextField).value
                }))
              }
            />
          </li>

          <li className="form-item">
            <label className="form-label">
              <span>{$t("options_advanced_rule_js_title")}</span>
              <TextButton
                role="link"
                type="button"
                href="https://github.com/WJ-Yuan/summarizer/wiki/Advanced-Settings-%E9%AB%98%E7%BA%A7%E8%AE%BE%E7%BD%AE"
                target="_blank"
                aria-label={$t("options_advanced_rule_js_action_description")}>
                <Icon slot="icon">open_in_new</Icon>
                {$t("options_advanced_rule_js_action")}
              </TextButton>
            </label>

            <CodeMirror
              ref={jsRef}
              value={rule.javascript}
              error={error.javascript.isError}
              errorMessage={error.javascript.errorMsg}
              onChange={(code) => {
                setRule((prev) => ({
                  ...prev,
                  javascript: code
                }))
              }}
            />
          </li>
        </ul>
      </form>
      <hr className="divider" />

      <footer className="rule-action">
        <FilledButton className="mr-12" onClick={handleSaveClick}>
          {$t("common_action_save")}
        </FilledButton>
        <OutlinedButton onClick={onCancel}>
          {$t("common_action_cancel")}
        </OutlinedButton>
      </footer>
    </>
  )
}

export default AdvancedDetail
