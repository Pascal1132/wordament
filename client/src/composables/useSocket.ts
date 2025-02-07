import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'

let socket: Socket | null = null
const isConnected = ref(false)
const socketUrl = '/'

export function useSocket() {
  if (!socket) {
    socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    socket.on('connect', () => {
      console.log('Socket connecté:', socket?.id)
      isConnected.value = true
    })

    socket.on('disconnect', () => {
      console.log('Socket déconnecté')
      isConnected.value = false
    })

    socket.on('connect_error', (error) => {
      console.error('Erreur de connexion socket:', error)
    })
  }

  return {
    socket: socket!,
    isConnected
  }
}
