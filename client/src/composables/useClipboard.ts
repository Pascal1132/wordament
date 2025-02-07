import { ref } from 'vue'

interface Toast {
  message: string
  type: 'success' | 'error'
}

const toast = ref<Toast | null>(null)

export function useClipboard() {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.value = {
        message: 'Copié dans le presse-papier !',
        type: 'success'
      }
      setTimeout(() => {
        toast.value = null
      }, 3000)
    } catch (error) {
      toast.value = {
        message: 'Erreur lors de la copie',
        type: 'error'
      }
      setTimeout(() => {
        toast.value = null
      }, 3000)
    }
  }

  return {
    copyToClipboard,
    toast
  }
}
