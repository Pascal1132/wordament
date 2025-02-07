<script setup lang="ts">
import { useUser } from './composables/useUser'
import { useGame } from './composables/useGame'
import { useSocket } from './composables/useSocket'
import UserCreation from './components/UserCreation.vue'
import GameCreation from './components/GameCreation.vue'
import GameInfo from './components/GameInfo.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { ref, onMounted } from 'vue'

const isLoading = ref(true);

library.add(faSpinner, faSignOutAlt)

const { isConnected } = useSocket()
const { username, logout } = useUser()
const { currentGame } = useGame()

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<template>
<div>
  <div class="app-container" v-show="!isLoading">
    <header class="app-header">
      <h1 class="game-title">Wordament</h1>
      <div v-if="username" class="user-section">
        <span class="username">{{ username }}</span>
        <button class="logout-button" @click="logout" title="Se déconnecter">
          <font-awesome-icon icon="sign-out-alt" />
        </button>
      </div>
    </header>

    <main class="main-content">
      <div v-if="!isConnected" class="status-message warning">
        <font-awesome-icon icon="spinner" spin />
        <span>Connexion au serveur en cours...</span>
      </div>

      <div v-else>
        <div v-if="!username">
          <UserCreation />
        </div>

        <div v-else class="game-container fade-in">
          <h2 class="welcome-message slide-up">
            Bienvenue, {{ username }} !
          </h2>

          <div v-if="!currentGame">
            <GameCreation />
          </div>

          <GameInfo v-else />
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>&copy; 2024 Wordament - Tous droits réservés</p>
    </footer>
  </div>

  <div v-show="isLoading">
    <div class="loading-container">
      <font-awesome-icon icon="spinner" spin />
      <span>Chargement...</span>
    </div>
  </div>
</div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Press+Start+2P&display=swap');

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: var(--primary-color);
  padding: 1.5rem;
  text-align: center;
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-title {
  color: white;
  font-family: var(--font-game);
  font-size: clamp(2rem, 5vw, 3rem);
  margin: 0;
  text-shadow: 3px 3px 0 var(--primary-hover);
}

.main-content {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.welcome-message {
  text-align: center;
  color: var(--primary-color);
  font-family: var(--font-game);
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  margin-bottom: 2rem;
}

.status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  margin: 1rem 0;
  font-weight: 500;
}

.status-message.warning {
  background: var(--warning-color);
  color: white;
}

.status-message.error {
  background: var(--error-color);
  color: white;
}

.app-footer {
  background: var(--card-background);
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
  box-shadow: var(--shadow-sm);
}

@keyframes titlePulse {
  from {
    opacity: 0.9;
    transform: scale(1);
  }
  to {
    opacity: 1;
    transform: scale(1.05);
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .main-content {
    padding: 1rem;
  }
}

.loading-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  z-index: 1000;
  position: fixed;
  height: 100vh;
  width: 100vw;
  background-color: var(--background-color);
  top: 0;
  left: 0;
  opacity: 0.8;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.5s ease-in-out;
  transition: opacity 0.3s ease-in-out;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.username {
  font-weight: 600;
  font-family: var(--font-game);
  font-size: 1rem;
}

.logout-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-button:hover {
  transform: scale(1.1);
  color: var(--warning-color);
}

</style>
