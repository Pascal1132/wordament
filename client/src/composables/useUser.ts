import { ref } from 'vue'
import { useSocket } from './useSocket'
import { useToast } from 'vue-toastification'
import { useGame } from './useGame'

// Flag pour l'initialisation des écouteurs
let listenersInitialized = false

export function useUser() {
  const { socket } = useSocket()
  const { leaveGame } = useGame()
  const toast = useToast()
  const username = ref('')
  const userId = ref('')
  const newUsername = ref('')
  const error = ref<string | null>(null)

  const createUser = () => {
    if (!newUsername.value.trim()) {
      toast.error('Le nom ne peut pas être vide')
      return
    }
    socket.emit('createUser', { name: newUsername.value })
  }

  const logout = () => {
    leaveGame()
    username.value = ''
    newUsername.value = ''
    userId.value = ''
    toast.success('Déconnexion réussie !')
  }

  // Socket listeners - initialisation unique
  if (!listenersInitialized) {
    socket.on('userCreated', (response) => {
      username.value = response.name
      userId.value = response.id
      toast.success('Profil créé avec succès !')
    })

    socket.on('error', (response) => {
      error.value = response.message
      toast.error(response.message)
    })

    listenersInitialized = true
  }

  return {
    username,
    newUsername,
    userId,
    createUser,
    error,
    logout
  }
}
