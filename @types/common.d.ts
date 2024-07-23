declare module "Common" {
  import type { ChatRole, ChatStatus, MESSAGE_EVENT } from "~/shared/constants"
  export interface Message<T> {
    type: MESSAGE_EVENT
    value: T
    tabId?: string | number
  }

  export interface Chat {
    role: ChatRole
    content: string
    status: ChatStatus
  }

  export interface Tab {
    id: number
    status: TabStatus
    url?: string
    title?: string
    favIconUrl?: string
  }

  export interface FormError {
    isError: boolean
    errorMessage: string
  }

  export interface DrawerProps {
    open: boolean
    onSave: () => void
  }

  export interface Filter {
    sensitive: string
    replacement: string
    id?: number
  }

  export interface Advanced {
    javascript: string
    url: string
    id?: number
  }

  export interface ForbiddenUrl {
    url: string
    id?: number
  }

  export interface DialogProps {
    open?: boolean
    onSave: (...args: any[]) => void
  }

  export interface DrawerDialogProps<T> extends DialogProps {
    type: DrawerDialogType
    row: T
    onClose: (...args: any[]) => any
  }

  export interface Validator {
    isError: boolean
    errorMsg: string
  }

  export interface Validation<K extends string> {
    isValid: boolean
    errorMsg?: ValidationErrorMsg
    errorKey?: K
  }
}
