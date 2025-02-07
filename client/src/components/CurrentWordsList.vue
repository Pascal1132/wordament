<script setup lang="ts">
import type { PlayerWord } from '../types/game'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPencil, faStar } from '@fortawesome/free-solid-svg-icons'
import { computed, ref, watch } from 'vue'

library.add(faPencil, faStar)

const props = defineProps<{
  words: PlayerWord[] | null,
}>()

const score = computed(() => {
  return props.words?.reduce((acc, word) => acc + word.points, 0) || 0
})

const lastAddedWord = ref<PlayerWord | null>(null)

watch(() => props.words, (newWords, oldWords) => {
  if (newWords && oldWords && newWords.length > oldWords.length) {
    lastAddedWord.value = newWords[newWords.length - 1]
    setTimeout(() => {
      lastAddedWord.value = null
    }, 2000)
  }
}, { deep: true })
</script>

<template>
  <div class="current-words-container card fade-in">
    <h3 class="words-title">
      <font-awesome-icon icon="pencil" class="title-icon" />
      Vos mots trouvés
    </h3>
    <div class="words-list" v-if="words && words.length > 0">
      <div v-for="word in words" :key="word.word" class="word-item slide-up">
        <span class="word-text">{{ word.word }}</span>
        <span class="word-points">+{{ word.points }}</span>
      </div>
    </div>
    <div v-else class="no-words">
      Aucun mot trouvé pour le moment
    </div>
    <div class="score-container">
      <span class="score-text">Score total : {{ score }}</span>
    </div>

    <!-- Notification pour le nouveau mot -->
    <div v-if="lastAddedWord" class="word-notification">
      <font-awesome-icon icon="star" class="notification-icon" />
      <span class="notification-text">Nouveau mot trouvé !</span>
      <div class="notification-word">
        {{ lastAddedWord.word }}
        <span class="notification-points">+{{ lastAddedWord.points }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.current-words-container {
  padding: 1.5rem;
  height: fit-content;
  min-width: 250px;
  margin-top: 2rem;
}

.words-title {
  color: var(--primary-color);
  font-family: var(--font-game);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  color: var(--secondary-color);
}

.words-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.word-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--background-color);
  border-radius: 2rem;
  transition: all 0.3s ease;
}

.word-text {
  font-weight: 500;
}

.word-points {
  color: var(--success-color);
  font-weight: 600;
  font-size: 0.9rem;
  background: var(--card-background);
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
}

.no-words {
  text-align: center;
  color: var(--text-secondary);
  padding: 1rem;
}

@media (max-width: 768px) {
  .current-words-container {
    margin-top: 1rem;
  }

  .words-list {
    justify-content: center;
  }
}

.score-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.word-notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  text-align: center;
  animation: notificationPopup 0.5s ease-out forwards;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(8px);
}

.notification-icon {
  font-size: 1.2rem;
  color: #FFD700;
  animation: starSpin 1s ease-out;
}

.notification-text {
  font-weight: 600;
  font-size: 0.9rem;
}

.notification-word {
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification-points {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.9rem;
}

@keyframes notificationPopup {
  0% {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -10%);
  }
  100% {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes starSpin {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .word-notification {
    width: 90%;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }

  .notification-text {
    font-size: 0.8rem;
  }

  .notification-word {
    font-size: 1rem;
  }
}
</style>
