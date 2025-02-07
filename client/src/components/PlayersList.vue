<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { Game } from '../types/game'

defineProps<{
  currentGame: Game
}>()
</script>

<template>
  <div class="players-section card">
    <h4>
      <font-awesome-icon icon="users" />
      Joueurs
    </h4>
    <ul class="players-list">
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
</template>

<style scoped>
.players-section {
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
</style>
