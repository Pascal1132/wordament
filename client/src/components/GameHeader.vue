<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useClipboard } from '../composables/useClipboard'
import { useGame } from '../composables/useGame'
import type { Game } from '../types/game'

const props = defineProps<{
  currentGame: Game
}>()

const emit = defineEmits<{
  leaveGame: []
}>()

const { copyToClipboard, toast:clipboardToast } = useClipboard()
const { remainingTime } = useGame()

const getStatusIcon = computed(() => {
  switch (props.currentGame?.status) {
    case 'waiting': return 'pause'
    case 'running': return 'play'
    case 'finished': return 'check'
    default: return 'pause'
  }
})
</script>

<template>
  <div class="game-header card">
    <div class="header-left">
      <button class="back-button" @click="emit('leaveGame')" title="Retour">
        <font-awesome-icon icon="arrow-left" />
      </button>
      <h3 class="game-title" @click="copyToClipboard(currentGame.id)" :title="'Copier l\'ID de la partie : ' + currentGame.id">
        <font-awesome-icon icon="gamepad" class="title-icon" />
        Partie #<span class="game-id">{{ currentGame.id }}</span>
        <div v-if="clipboardToast" class="toast" :class="clipboardToast.type">
          {{ clipboardToast.message }}
        </div>
        <button v-else class="copy-button" title="Copier l'ID">
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


  </div>
</template>

<style scoped>
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

.copy-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
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

.game-title .toast {
  color: white;
  font-size: 0.5rem;
  text-shadow: none;
  margin-left: 0.5rem;
  margin-top: 0.5rem;
  font-family: var(--font-game);
}

.game-id {
  color: var(--accent-color);
}
.game-title:hover .game-id {
  color: var(--secondary-color);
}

.game-title:hover {
  color: var(--accent-color);
  text-shadow: 2px 2px 0 var(--primary-hover);
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
</style>
