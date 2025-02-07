<script setup lang="ts">
import type { PlayerWord } from '../types/game'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPencil } from '@fortawesome/free-solid-svg-icons'

library.add(faPencil)

defineProps<{
  words: PlayerWord[] | null
}>()
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
</style>
