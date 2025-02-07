import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useSocket } from './useSocket'
import type { Game, Grid, PlayerScore, PlayerWord, WordValidatingError } from '../types/game'

const currentGame: Ref<Game | null> = ref(null)
const currentPlayerWords: Ref<PlayerWord[] | null> = ref(null)
const gameIdToJoin = ref('')
const remainingTime = ref(0)
const wordValidatingError = ref<WordValidatingError | false>(false)
const wordValidatingErrorTimer = ref<number | null>(null)

// Initialisation des écouteurs une seule fois
let listenersInitialized = false

export function useGame() {
  const { socket } = useSocket()

  const isAdmin = computed(() => {
    if (!currentGame.value || !socket.id) return false
    return currentGame.value.admin === socket.id
  })

  // Actions
  const createGame = () => {
    console.log('Tentative de création de partie...')
    currentPlayerWords.value = null
    socket.emit('createGame', {})
  }

  const handleWordSelect = (word: string) => {
    if (!currentGame.value) return
    socket.emit('wordSelect', { gameId: currentGame.value.id, word })
  }

  const joinGame = () => {
    if (!gameIdToJoin.value.trim()) {
      return false
    }

    socket.emit('joinGame', { gameId: gameIdToJoin.value })
    return true
  }

  const startGame = () => {
    if (!currentGame.value) return
    socket.emit('startGame', { gameId: currentGame.value.id })
  }

  const revenge = () => {
    if (!currentGame.value) return
    socket.emit('revenge', { gameId: currentGame.value.id })
  }

  const leaveGame = () => {
    if (currentGame.value) {
      socket.emit('leaveGame', { gameId: currentGame.value.id })
    }
    currentGame.value = null
    currentPlayerWords.value = null
  }

  // Initialisation des écouteurs une seule fois
  if (!listenersInitialized) {
    socket.on('connect', () => {
      console.log('Connecté au serveur socket', socket.id)
    })

    socket.on('disconnect', () => {
      console.log('Déconnecté du serveur socket')
    })

    socket.on('gameCreated', (response: { game: Game }) => {
      console.log('Partie créée:', response)
      currentGame.value = response.game
      currentGame.value.grid = undefined
      currentGame.value.playerScores = []
      currentGame.value.words = []
      currentPlayerWords.value = null
      gameIdToJoin.value = ''
    })

    socket.on('playerJoined', (response: { game: Game }) => {
      currentGame.value = response.game
      console.log('Joueur rejoint la partie:', response.game)
    })

    socket.on('gameStatusChanged', (response: { gameId: string, status: Game['status'], grid?: Grid, playerScores: PlayerScore[], words: PlayerWord[] }) => {
      if (currentGame.value && currentGame.value.id === response.gameId) {
        currentGame.value.status = response.status
        currentGame.value.grid = response.grid
        currentGame.value.playerScores = response.playerScores
        currentGame.value.words = response.words

        // Initialiser currentPlayerWords à un tableau vide au démarrage du jeu
        if (response.status === 'running') {
          currentPlayerWords.value = []
        }
      }
    })

    socket.on('wordSelected', (response: { gameId: string, status: Game['status'], grid?: Grid, playerScores: PlayerScore[], currentPlayerWords: PlayerWord[] }) => {
      if (currentGame.value && currentGame.value.id === response.gameId) {
        currentGame.value.status = response.status
        currentGame.value.grid = response.grid
        currentGame.value.playerScores = response.playerScores
        currentPlayerWords.value = response.currentPlayerWords
      }
    })

    socket.on('wordValidatingError', (response: { gameId: string, code: string, word: string }) => {
      if (currentGame.value && currentGame.value.id === response.gameId) {
        wordValidatingError.value = {
          gameId: response.gameId,
          code: response.code,
          word: response.word
        }
        if (wordValidatingErrorTimer.value) {
          clearTimeout(wordValidatingErrorTimer.value)
        }
        wordValidatingErrorTimer.value = setTimeout(() => {
          wordValidatingError.value = false
        }, 1250)
      }
    })

    socket.on('timer', (response: { gameId: string, remainingTime: number }) => {
      if (currentGame.value && currentGame.value.id === response.gameId) {
        remainingTime.value = response.remainingTime
      }
    })

    socket.on('playerLeft', (response: { game: Game }) => {
      if (currentGame.value && currentGame.value.id === response.game.id) {
        currentGame.value = response.game
      }
    })

    socket.on('adminChanged', (response: { gameId: string, newAdmin: string }) => {
      if (currentGame.value && currentGame.value.id === response.gameId) {
        currentGame.value.admin = response.newAdmin
      }
    })

    socket.on('gameEnded', (response: { gameId: string }) => {
      if (currentGame.value && currentGame.value.id === response.gameId) {
        currentGame.value.status = 'finished'
      }
    })

    socket.on('error', (error) => {
      console.error('Erreur socket:', error)
    })

    listenersInitialized = true
  }

  return {
    currentGame,
    currentPlayerWords,
    gameIdToJoin,
    remainingTime,
    wordValidatingError,
    isAdmin,
    createGame,
    joinGame,
    startGame,
    revenge,
    handleWordSelect,
    leaveGame
  }
}
