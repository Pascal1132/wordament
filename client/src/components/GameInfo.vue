<script setup lang="ts">
import { useGame } from '../composables/useGame'
import { useUser } from '../composables/useUser'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faGamepad,
  faUsers,
  faUser,
  faCrown,
  faTrophy,
  faPlay,
  faClock,
  faSpinner,
  faCheck,
  faPause,
  faPencil,
  faCopy,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons'
import GameHeader from './GameHeader.vue'
import PlayersList from './PlayersList.vue'
import ScoresBoard from './ScoresBoard.vue'
import GamePlayArea from './GamePlayArea.vue'

library.add(faGamepad, faUsers, faUser, faCrown, faTrophy, faPlay, faClock, faSpinner, faCheck, faPause, faPencil, faCopy, faArrowLeft)

const { wordValidatingError, currentGame, currentPlayerWords, remainingTime, isAdmin, startGame, handleWordSelect, leaveGame, revenge } = useGame()
const { userId } = useUser()
</script>

<template>
  <div v-if="currentGame" class="game-info-container fade-in">
    <GameHeader
      :current-game="currentGame"
      @leave-game="leaveGame"
    />

    <div class="game-content">
      <div class="game-main-section">
        <PlayersList
          v-if="currentGame.status === 'waiting'"
          :current-game="currentGame"
        />

        <ScoresBoard
          v-if="currentGame.status !== 'waiting'"
          :current-game="currentGame"
        />

        <GamePlayArea
          :current-game="currentGame"
          :current-player-words="currentPlayerWords"
          @on-word-select="handleWordSelect"
          :word-validating-error="wordValidatingError"
        />
      </div>

      <button v-if="isAdmin && currentGame.status === 'waiting'"
              @click="startGame"
              class="start-button">
        <font-awesome-icon icon="play" />
        Démarrer la partie
      </button>

      <button
              @click="revenge" v-if="currentGame.status === 'finished'"
              class="revenge-button">
        <font-awesome-icon icon="gamepad" />
        Revanche
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-info-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.game-content {
  display: grid;
  gap: 2rem;
}

.start-button {
  width: 100%;
  max-width: 300px;
  margin: 2rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  background: var(--success-color);
}

.start-button:hover {
  background: var(--success-color);
  filter: brightness(1.1);
}

.revenge-button {
  width: 100%;
  max-width: 300px;
  margin: 2rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  background: var(--accent-color);
  animation: bounceIn 0.5s ease-out;
}

.revenge-button:hover {
  background: var(--accent-color);
  filter: brightness(1.1);
  transform: scale(1.05);
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
