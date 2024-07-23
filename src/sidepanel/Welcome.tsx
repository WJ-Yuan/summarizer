import Logo from "~/assets/icon-128.svg?react"
import { $t } from "~/shared/utils"

const Welcome = ({ onClick }: { onClick: () => void }) => {
  return (
    <article className="body welcome">
      <header>
        <button
          className="logo-button"
          title={$t("sidepanel_welcome_logo_title")}
          aria-label={$t("sidepanel_welcome_logo_title")}
          onClick={onClick}>
          <Logo
            className="logo"
            aria-label={$t("sidepanel_welcome_logo_description")}
          />
        </button>
      </header>
      <main className="info">
        <h1 className="text">{$t("sidepanel_welcome_header")}</h1>
      </main>
      <footer className="action">
        <p className="text">
          <span className="suffix">{$t("sidepanel_welcome_info")}</span>
          <a
            href="#"
            role="button"
            className="button"
            title={$t("sidepanel_welcome_logo_title")}
            aria-label={$t("sidepanel_welcome_logo_title")}
            onClick={onClick}>
            {$t("sidepanel_welcome_action")}
          </a>
        </p>
      </footer>
    </article>
  )
}

export default Welcome
