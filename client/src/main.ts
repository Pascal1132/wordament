import './assets/main.css'
import 'vue-toastification/dist/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { FontAwesomeIcon } from './plugins/fontawesome'
import Toast, { type PluginOptions, POSITION } from 'vue-toastification'

const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: true,
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__fade',
  maxToasts: 3,
  newestOnTop: true
}

const app = createApp(App)

app.use(router)
app.use(Toast, toastOptions)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')

// Ajout des styles personnalisés pour les toasts
const style = document.createElement('style')
style.textContent = `
  .Vue-Toastification__toast {
    border-radius: var(--border-radius) !important;
    font-family: var(--font-primary) !important;
    padding: 1rem !important;
    box-shadow: var(--shadow-md) !important;
    min-height: auto !important;
  }

  .Vue-Toastification__toast--success {
    background-color: var(--success-color) !important;
  }

  .Vue-Toastification__toast--error {
    background-color: var(--error-color) !important;
  }

  .Vue-Toastification__toast--warning {
    background-color: var(--warning-color) !important;
  }

  .Vue-Toastification__toast--info {
    background-color: var(--primary-color) !important;
  }

  .Vue-Toastification__progress-bar {
    background: rgba(255, 255, 255, 0.3) !important;
  }

  .Vue-Toastification__close-button {
    color: white !important;
    opacity: 0.8 !important;
  }

  .Vue-Toastification__close-button:hover {
    opacity: 1 !important;
  }

  .Vue-Toastification__toast-body {
    font-size: 0.95rem !important;
    line-height: 1.5 !important;
  }
`
document.head.appendChild(style)
