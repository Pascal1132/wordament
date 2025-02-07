<script setup lang="ts">
import { useGame } from '../composables/useGame'
import GameGrid from './GameGrid.vue'
import CurrentWordsList from './CurrentWordsList.vue'
import { computed, ref, watch } from 'vue'
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
import { useClipboard } from '../composables/useClipboard'

library.add(faGamepad, faUsers, faUser, faCrown, faTrophy, faPlay, faClock, faSpinner, faCheck, faPause, faPencil, faCopy, faArrowLeft)

const { currentGame, currentPlayerWords, remainingTime, isAdmin, startGame, handleWordSelect, leaveGame } = useGame()
const { copyToClipboard, toast } = useClipboard()

const showGrid = ref(true)

// Surveiller le changement de statut pour gérer l'affichage de la grille
watch(() => currentGame.value?.status, async (newStatus, oldStatus) => {
  if (newStatus === 'finished' && oldStatus === 'running') {
    // On attend que l'animation d'explosion soit terminée (2.7s)
    await new Promise(resolve => setTimeout(resolve, 2700));
    showGrid.value = false;
  } else if (newStatus === 'running') {
    showGrid.value = true;
  }
})

const getStatusIcon = computed(() => {
  switch (currentGame.value?.status) {
    case 'waiting': return 'pause'
    case 'playing': return 'spinner'
    case 'finished': return 'check'
    default: return 'pause'
  }
})
</script>

<template>
  <div v-if="currentGame" class="game-info-container fade-in">
    <div class="game-header card">
      <div class="header-left">
        <button class="back-button" @click="leaveGame" title="Retour">
          <font-awesome-icon icon="arrow-left" />
        </button>
        <h3 class="game-title" @click="copyToClipboard(currentGame.id)" :title="'Copier l\'ID de la partie : ' + currentGame.id">
          <font-awesome-icon icon="gamepad" class="title-icon"  />
          Partie #{{ currentGame.id }}
          <button class="copy-button" title="Copier l'ID">
            <font-awesome-icon icon="copy" class="copy-icon" />
          </button>
        </h3>
      </div>

      <div class="game-status">
        <div class="status-badge" :class="currentGame.status">
          <font-awesome-icon :icon="getStatusIcon" />
          {{ currentGame.status }}
        </div>
        <div class="timer" v-if="currentGame.status === 'running'">
          <font-awesome-icon icon="clock" />
          {{ remainingTime }}s
        </div>
      </div>

      <div v-if="toast" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </div>

    <div class="game-content">
      <div class="game-main-section">
      <div class="players-section card" v-if="currentGame.status == 'waiting'">
        <h4>
          <font-awesome-icon icon="users" />
          Joueurs
        </h4>
        <ul class="players-list" >
          <li v-for="player in currentGame.players" :key="player.id" class="player-item slide-up">
            <font-awesome-icon icon="user" />
            {{ player.name }}
            <span v-if="player.id === currentGame.admin" class="admin-badge">
              <font-awesome-icon icon="crown" />
              Admin
            </span>
          </li>
        </ul>
      </div>

        <div class="game-play-area">
          <div v-if="showGrid && currentGame.status === 'running' && currentGame.grid" class="grid-section">
            <GameGrid :grid="currentGame.grid" @onWordSelect="handleWordSelect" />
          </div>

          <div v-if="currentGame.status === 'running'" class="words-section">
            <CurrentWordsList :words="currentPlayerWords" />
          </div>
      </div>

      <div class="scores-section card" v-if="currentGame.status !== 'waiting'">
        <h4>
          <font-awesome-icon icon="trophy" />
          Scores
        </h4>
        <div class="scores-grid">
          <div v-for="playerScore in currentGame.playerScores" :key="playerScore.playerId" class="player-score slide-up">
            <div class="score-header">
              <span class="player-name">{{ playerScore.playerName }}</span>
              <span class="score-value">{{ playerScore.score }} pts</span>
            </div>
            <ul class="words-list" v-if="currentGame.words">
              <li v-for="word in currentGame.words.filter(w => w.playerId === playerScore.playerId)"
                  :key="word.word"
                  class="word-item">
                {{ word.word }}
                <span class="word-points">+{{ word.points }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </div>

      <button v-if="isAdmin && currentGame.status === 'waiting'"
              @click="startGame"
              class="start-button">
        <font-awesome-icon icon="play" />
        Démarrer la partie
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

.game-header {
  margin-bottom: 2rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  color: var(--secondary-color);
  transform: translateX(-3px);
}

.game-title {
  color: var(--primary-color);
  font-family: var(--font-game);
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
}

.game-title:hover {
  color: var(--secondary-color);
  text-shadow: 2px 2px 0 var(--primary-hover);
}

.game-title:hover .copy-icon {
  transform: scale(1.5);
  transition: transform 0.3s ease-in-out;
}

.copy-icon {
  transition: transform 0.3s ease-in-out;
}


.title-icon {
  color: var(--secondary-color);
}

.game-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge.waiting {
  background-color: var(--warning-color);
  color: white;
}

.status-badge.playing {
  background-color: var(--success-color);
  color: white;
}

.status-badge.finished {
  background-color: var(--accent-color);
  color: white;
}

.timer {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.game-content {
  display: grid;
  gap: 2rem;
}

.players-section, .scores-section {
  padding: 1.5rem;
}

h4 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.players-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.player-item {
  padding: 0.75rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-badge {
  margin-left: auto;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.scores-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.player-score {
  background: var(--background-color);
  border-radius: var(--border-radius);
  padding: 1rem;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.player-name {
  font-weight: 600;
}

.score-value {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius);
}

.words-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.25rem;
}

.word-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--card-background);
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.word-points {
  color: var(--success-color);
  font-weight: 600;
  position: relative;
  animation: pointsPopup 0.5s ease-out;
}

@keyframes pointsPopup {
  0% {
    transform: scale(0) translateY(20px);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) translateY(-5px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
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

.game-play-area {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.grid-section {
  flex: 1;
  min-width: 0;
}

.words-section {
  width: 300px;
}

.copy-button {
  background: none;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
}

.copy-button:hover {
  transform: scale(1.1);
}

.toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  color: white;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  background-color: var(--success-color);
}

.toast.error {
  background-color: var(--error-color);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .game-play-area {
    flex-direction: column;
  }

  .words-section {
    width: 100%;
  }
}
</style>
