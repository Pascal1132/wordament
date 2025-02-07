declare module 'vue-toastification' {
  import { Plugin } from 'vue'

  export const POSITION: {
    TOP_LEFT: 'top-left'
    TOP_CENTER: 'top-center'
    TOP_RIGHT: 'top-right'
    BOTTOM_LEFT: 'bottom-left'
    BOTTOM_CENTER: 'bottom-center'
    BOTTOM_RIGHT: 'bottom-right'
  }

  export interface PluginOptions {
    position?: string
    timeout?: number
    closeOnClick?: boolean
    pauseOnFocusLoss?: boolean
    pauseOnHover?: boolean
    draggable?: boolean
    draggablePercent?: number
    showCloseButtonOnHover?: boolean
    hideProgressBar?: boolean
    closeButton?: boolean
    icon?: boolean
    rtl?: boolean
    transition?: string
    maxToasts?: number
    newestOnTop?: boolean
  }

  const plugin: Plugin
  export default plugin
  export function useToast(): {
    success(msg: string): void
    error(msg: string): void
    warning(msg: string): void
    info(msg: string): void
  }
}
