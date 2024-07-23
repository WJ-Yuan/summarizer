import { javascript } from "@codemirror/lang-javascript"
import { EditorState, Prec } from "@codemirror/state"
import { basicSetup, EditorView } from "codemirror"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { $t } from "~/shared/utils"
import "./editor.scss"

interface CodeMirrorProps {
  value: string
  onChange: (code: string) => void
  error?: boolean
  errorMessage?: string
}

const CodeMirror = forwardRef<HTMLDivElement, CodeMirrorProps>(
  ({ value, onChange, error = false, errorMessage = "" }, ref) => {
    const editor = useRef<HTMLDivElement>(null)

    useImperativeHandle(
      ref,
      () =>
        ({
          focus: () => {
            if (editor.current) {
              const view = editor.current.querySelector(".cm-content")
              if (view) {
                ;(view as HTMLElement).focus()
              }
            }
          }
        }) as HTMLDivElement
    )

    useEffect(() => {
      const theme = EditorView.theme(
        {
          "&": {
            color: "var(--md-sys-color-on-surface-variant)",
            backgroundColor: "transparent",
            height: "300px",
            border: "1px solid var(--md-sys-color-outline)",
            borderRadius: "var(--md-sys-shape-corner-extra-small)",
            fontFamily: "var(--md-ref-typeface-plain)"
          },
          "&.cm-focused": {
            outline: "none",
            border: "3px solid var(--md-sys-color-primary)"
          },
          ".cm-gutters": {
            borderRadius: "var(--md-sys-shape-corner-extra-small)",
            backgroundColor: "transparent",
            color: "var(--md-sys-color-on-surface-variant)",
            border: "none"
          },
          ".cm-activeLine": {
            backgroundColor: "transparent"
          },
          ".cm-activeLineGutter": {
            backgroundColor: "transparent"
          }
        },
        { dark: false }
      )

      const state = EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          Prec.high(theme),
          javascript(),
          EditorView.updateListener.of((update) => {
            if (update.changes) {
              onChange(update.state.doc.toString())
            }
          })
        ]
      })

      const view = new EditorView({
        state,
        parent: editor.current!,
        root: document
      })

      return () => {
        view.destroy()
      }
    }, [])

    return (
      <>
        <div
          ref={editor}
          className={error ? "error" : ""}
          aria-label={$t("common_components_codemirror_description")}></div>
        {error && !!errorMessage && (
          <div className="supporting-text error">{errorMessage}</div>
        )}
      </>
    )
  }
)

export default CodeMirror
