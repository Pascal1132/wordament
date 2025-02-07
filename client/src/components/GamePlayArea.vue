<script setup lang="ts">
import { computed } from 'vue'
import type { Game, WordValidatingError, PlayerWord } from '../types/game'
import GameGrid from './GameGrid.vue'
import CurrentWordsList from './CurrentWordsList.vue'

const props = defineProps<{
  currentGame: Game
  currentPlayerWords: PlayerWord[] | null
  wordValidatingError: WordValidatingError | false
}>()

const emit = defineEmits<{
  onWordSelect: [word: string]
}>()

const safeCurrentPlayerWords = computed(() => props.currentPlayerWords || [])
</script>

<template>
  <div class="game-play-area">
    <div v-if="currentGame.status === 'running' && currentGame.grid" class="grid-section">
      <GameGrid :grid="currentGame.grid" @onWordSelect="emit('onWordSelect', $event)" :error="wordValidatingError" />
    </div>

    <div v-if="currentGame.status === 'running'" class="words-section">
      <CurrentWordsList :words="safeCurrentPlayerWords" />
    </div>
  </div>
</template>

<style scoped>
.game-play-area {
  display: flex;
  gap: 2rem;
  margin: 2rem 0;
}

.grid-section {
  flex: 1;
  min-width: 0;
  position: relative;
}

.words-section {
  width: 300px;
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
