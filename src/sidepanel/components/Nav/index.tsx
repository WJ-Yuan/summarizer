import { useEffect, useRef, useState } from "react"
import browser from "webextension-polyfill"
import { $snackbar, Fab, FilledTonalIconButton, Icon } from "~/components/Proxy"
import RemoveDialog from "~/components/RemoveDialog"
import { useStorage, useThemeChange } from "~/hooks"
import { StorageKey } from "~/shared/constants"
import { $t, isForbiddenUrlValid } from "~/shared/utils"

const Nav = ({
  isSuspendVisible,
  onSuspend
}: {
  isSuspendVisible: boolean
  onSuspend: () => void
}) => {
  const { colorRef, baseColor, updateTheme, openColorPanel } = useThemeChange()

  const [isRotate, setIsRotate] = useState(false)
  const [isSettingVisible, setIsSettingVisible] = useState(false)
  const [forbiddenOpen, setForbiddenOpen] = useState<boolean>(false)
  const [url, setUrl] = useState<string>("")
  const [renderUrlTable, setUrlTable] = useStorage<string[]>(
    StorageKey.ForbiddenUrl
  )
  const ulRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    isSuspendVisible && setIsSettingVisible(false)
  }, [isSuspendVisible])

  const openSetting = () => {
    browser.runtime.openOptionsPage()
  }

  const openDialog = async () => {
    const [tab] = await browser.tabs.query({
      active: true,
      lastFocusedWindow: true
    })

    if (!tab.url) {
      $snackbar("URL" + $t("sidepanel_nav_forbidden_url_confirm_error"))
      return
    }

    setUrl(tab.url || "")
    setForbiddenOpen(true)
  }

  const onCancel = () => {
    setForbiddenOpen(false)

    // why disable: width will shorten before dialog disappear
    // setUrl("")
  }

  const onSave = () => {
    const validation = isForbiddenUrlValid(
      { url, id: NaN },
      (renderUrlTable || []).map((u, index) => ({
        url: u,
        id: index
      }))
    )

    if (validation.isValid) {
      setUrlTable([url, ...(renderUrlTable || [])])
    } else {
      $snackbar($t(validation.errorMsg))
    }

    onCancel()
  }

  return (
    <aside className="aside">
      <nav>
        {isSuspendVisible ? (
          <Fab
            variant="primary"
            size="small"
            title={$t("sidepanel_nav_suspend_title")}
            aria-label={$t("sidepanel_nav_suspend_title")}
            onClick={onSuspend}>
            <Icon slot="icon">stop_circle</Icon>
          </Fab>
        ) : (
          <>
            <ul ref={ulRef} className={"action-list"}>
              <li className="action-item">
                <input
                  ref={colorRef}
                  type="color"
                  className="color"
                  aria-label={$t(
                    "sidepanel_nav_update_theme_panel_description"
                  )}
                  value={baseColor}
                  onChange={updateTheme}
                />
                <FilledTonalIconButton
                  type="button"
                  title={$t("sidepanel_nav_update_theme_title")}
                  aria-label={$t("sidepanel_nav_update_theme_title")}
                  onClick={openColorPanel}>
                  <Icon>palette</Icon>
                </FilledTonalIconButton>
              </li>
              <li className="action-item">
                <FilledTonalIconButton
                  type="button"
                  title={$t("sidepanel_nav_forbidden_url_title")}
                  aria-label={$t("sidepanel_nav_forbidden_url_title")}
                  onClick={openDialog}>
                  <Icon>dangerous</Icon>
                </FilledTonalIconButton>
              </li>
              <li className="action-item">
                <FilledTonalIconButton
                  type="button"
                  title={$t("sidepanel_nav_open_options_title")}
                  aria-label={$t("sidepanel_nav_open_options_title")}
                  onClick={openSetting}>
                  <Icon>open_in_new</Icon>
                </FilledTonalIconButton>
              </li>
            </ul>
            <Fab
              variant="primary"
              size="small"
              aria-label={$t("sidepanel_nav_setting_switch_description")}
              className={isRotate ? "rotate-in" : ""}
              onClick={() => {
                if (isSettingVisible) {
                  ulRef.current?.classList.remove("visible")
                  ulRef.current?.classList.add("hidden")
                } else {
                  ulRef.current?.classList.remove("hidden")
                  ulRef.current?.classList.add("visible")
                }

                setIsRotate(true)
                setIsSettingVisible((prev) => !prev)
                setTimeout(() => setIsRotate(false), 500)
              }}>
              <Icon slot="icon">settings</Icon>
            </Fab>
          </>
        )}

        <RemoveDialog
          open={forbiddenOpen}
          header={$t("sidepanel_nav_forbidden_url_confirm_header")}
          detail={$t("sidepanel_nav_forbidden_url_confirm_detail", url)}
          onCancel={onCancel}
          onConfirm={onSave}
        />
      </nav>
    </aside>
  )
}

export default Nav
