<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { Game } from '../types/game'
import { computed, ref } from 'vue'

const props = defineProps<{
  currentGame: Game
}>()

const topThreePlayers = computed(() => {
  return [...props.currentGame.playerScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
})

const expandedPlayers = ref<string[]>([])

const toggleWordsList = (playerId: string) => {
  if (expandedPlayers.value.includes(playerId)) {
    expandedPlayers.value = expandedPlayers.value.filter(id => id !== playerId)
  } else {
    expandedPlayers.value.push(playerId)
  }
}

const isExpanded = (playerId: string) => expandedPlayers.value.includes(playerId)
</script>

<template>
  <div class="scores-section card">
    <h4>
      <font-awesome-icon icon="trophy" />
      Scores
    </h4>

    <!-- Podium -->
    <div class="podium" v-if="topThreePlayers.length && currentGame.status === 'finished'">
      <div class="podium-spots">
        <!-- 2ème place -->
        <div class="podium-spot second" v-if="topThreePlayers[1]">
          <div class="player-avatar">🥈</div>
          <div class="podium-block">
            <span class="player-name">{{ topThreePlayers[1].playerName }}</span>
            <span class="score-value">{{ topThreePlayers[1].score }} pts</span>
          </div>
        </div>

        <!-- 1ère place -->
        <div class="podium-spot first" v-if="topThreePlayers[0]">
          <div class="player-avatar">👑</div>
          <div class="podium-block">
            <span class="player-name">{{ topThreePlayers[0].playerName }}</span>
            <span class="score-value">{{ topThreePlayers[0].score }} pts</span>
          </div>
        </div>

        <!-- 3ème place -->
        <div class="podium-spot third" v-if="topThreePlayers[2]">
          <div class="player-avatar">🥉</div>
          <div class="podium-block">
            <span class="player-name">{{ topThreePlayers[2].playerName }}</span>
            <span class="score-value">{{ topThreePlayers[2].score }} pts</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste existante des scores -->
    <div class="scores-grid">
      <div v-for="playerScore in currentGame.playerScores" :key="playerScore.playerId" class="player-score slide-up">
        <div class="score-header">
          <span class="player-name">{{ playerScore.playerName }}</span>
          <span class="score-value">{{ playerScore.score }} pts</span>
        </div>
        <ul class="words-list" v-if="currentGame.words">
          <template v-for="(word, index) in currentGame.words.filter(w => w.playerId === playerScore.playerId)"
                    :key="word.word">
            <li v-if="index < 5 || isExpanded(playerScore.playerId)"
                class="word-item">
              {{ word.word }}
              <span class="word-points">+{{ word.points }}</span>
            </li>
          </template>

          <li v-if="currentGame.words.filter(w => w.playerId === playerScore.playerId).length > 5"
              class="toggle-button"
              @click="toggleWordsList(playerScore.playerId)">
            <button class="show-more-btn">
              {{ isExpanded(playerScore.playerId) ? 'Voir moins' : 'Voir plus' }}
              <font-awesome-icon :icon="isExpanded(playerScore.playerId) ? 'chevron-up' : 'chevron-down'" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scores-section {
  padding: 1.5rem;
}

h4 {
  color: var(--primary-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  animation: slideDown 0.3s ease-out;
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Styles du podium */
.podium {
  margin: 2rem 0;
  perspective: 1000px;
}

.podium-spots {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 2rem;
  height: 400px;
  padding: 2rem;
  margin-bottom: 2rem;
  transform-style: preserve-3d;
}

.podium-spot {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.podium-spot:hover {
  transform: translateY(-10px) scale(1.05);
}

.player-avatar {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
  transform: translateZ(20px);
}

.podium-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  width: 180px;
  min-height: 140px;
  position: relative;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.first {
  z-index: 3;
  animation: podiumAppear 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both;
}

.first .podium-block {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  height: 220px;
  border: 2px solid rgba(255, 215, 0, 0.5);
}

.second {
  z-index: 2;
  animation: podiumAppear 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
}

.second .podium-block {
  background: linear-gradient(135deg, #e0e0e0, #b0b0b0);
  height: 180px;
  border: 2px solid rgba(192, 192, 192, 0.5);
}

.third {
  z-index: 1;
  animation: podiumAppear 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

.third .podium-block {
  background: linear-gradient(135deg, #cd7f32, #8b4513);
  height: 160px;
  border: 2px solid rgba(205, 127, 50, 0.5);
}

.podium-spot .player-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  text-align: center;
  background: rgba(81, 81, 81, 0.7);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  width: 85%;
  min-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.first .player-name {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.second .player-name {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(192, 192, 192, 0.3);
}

.third .player-name {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(205, 127, 50, 0.3);
}

.podium-spot .score-value {
  font-size: 0.9rem;
  font-weight: bold;
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  transform: translateZ(10px);
}

@keyframes podiumAppear {
  0% {
    transform: translateY(100px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.toggle-button {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  background: none !important;
  padding: 0 !important;
}

.show-more-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.show-more-btn:hover {
  background: var(--background-color);
}

@media (max-width: 480px) {
  .podium {
    padding: 0.5rem;
  }


  .podium-spots {
    gap: 0.5rem;
    height: 200px;
  }

  .podium-spot {
    min-width: 80px;
  }

  .podium-spot .player-avatar {
    font-size: 1.5rem;
    margin-bottom: 0.3rem;
  }

  .podium-spot .player-name {
    font-size: 0.8rem;
  }

  .podium-spot .score-value {
    font-size: 0.7rem;
  }

  .podium-block {
    padding: 0.3rem;
    min-height: 80px;
  }

  .first {
    height: 120px;
  }

  .second {
    height: 100px;
  }

  .third {
    height: 80px;
  }
  .podium-block {
    width: 80px;
  }
  .podium-block .player-name {
    font-size: 0.5rem;
    width: 100%;
    min-width: 0;
    padding: 0.1rem;
  }
}
</style>
