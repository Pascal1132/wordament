<script setup lang="ts">
import { useGame } from '../composables/useGame'
import { useSocket } from '../composables/useSocket'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faPlus,
  faUsers,
  faHashtag,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons'

library.add(faPlus, faUsers, faHashtag, faSignInAlt)

const { gameIdToJoin, createGame, joinGame, currentGame } = useGame()
const { isConnected } = useSocket()

const handleJoinGame = async () => {
  if (!isConnected.value) {
    alert('Erreur: Non connecté au serveur. Veuillez réessayer.')
    return
  }

  if (!gameIdToJoin.value.trim()) {
    alert('Veuillez entrer un ID de partie valide')
    return
  }

  try {
    await joinGame()
  } catch (error) {
    console.error('Erreur lors de la tentative de rejoindre la partie:', error)
    alert('Erreur lors de la tentative de rejoindre la partie. Veuillez réessayer.')
  }
}
</script>

<template>
  <div v-if="!currentGame" class="game-creation-container fade-in">
    <div class="options-grid">
      <div class="option-card card" @click="createGame">
        <div class="option-icon">
          <font-awesome-icon icon="plus" />
        </div>
        <h3>Nouvelle partie</h3>
        <p>Créer une nouvelle partie et inviter des amis</p>
      </div>

      <div class="option-card card">
        <div class="option-icon">
          <font-awesome-icon icon="users" />
        </div>
        <h3>Rejoindre une partie</h3>
          <div class="input-group">
            <font-awesome-icon icon="hashtag" class="input-icon" />
            <input
              v-model="gameIdToJoin"
              placeholder="ID de la partie"
              class="game-id-input"
              type="text"
              @keyup.enter="handleJoinGame"
              required
            />
          </div>
          <button class="join-button" @click.prevent="handleJoinGame">
            <font-awesome-icon icon="sign-in-alt" />
            Rejoindre
          </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-creation-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.option-card {
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: linear-gradient(
    135deg,
    var(--card-background) 0%,
    var(--background-color) 100%
  );
  position: relative;
  overflow: hidden;
}

.option-card:first-child {
  cursor: pointer;
}

.option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(236, 72, 153, 0.1) 50%,
    rgba(139, 92, 246, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.option-card:hover::before {
  opacity: 1;
}

.option-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.option-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.option-card:hover .option-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

h3 {
  color: var(--primary-color);
  font-family: var(--font-game);
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.join-form {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.input-group, .join-button {
  position: relative;
  z-index: 2;
  margin-top: 1.5rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.game-id-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 1rem;
  border: 2px solid var(--text-secondary);
  border-radius: var(--border-radius);
  background: var(--card-background);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.game-id-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.join-button {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
  color: white;
  padding: 0.75rem 1.5rem;
  width: 100%;
  max-width: 200px;
  margin: 0 auto;
  font-size: 1rem;
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.join-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

@media (max-width: 480px) {
  .game-creation-container {
    margin: 1rem;
  }
  .options-grid {
    gap: 1rem;
  }
  .option-card {
    padding: 1.5rem;
  }
  .option-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  h3 {
    font-size: 1.1rem;
  }
}
</style>
