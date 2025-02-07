<script setup lang="ts">
import { useUser } from '../composables/useUser'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserPlus, faUser, faPlay } from '@fortawesome/free-solid-svg-icons'

library.add(faUserPlus, faUser, faPlay)

const { newUsername, error, createUser } = useUser()
</script>

<template>
  <div class="user-creation-container card fade-in">
    <h2 class="title">
      <font-awesome-icon icon="user-plus" class="title-icon" />
      Créer un profil
    </h2>

    <div class="form-container">
      <div class="input-group">
        <font-awesome-icon icon="user" class="input-icon" />
        <input
          v-model="newUsername"
          placeholder="Nom d'utilisateur"
          class="username-input"
          @keyup.enter="createUser"
        />
      </div>

      <button @click="createUser" class="create-button">
        <font-awesome-icon icon="play" />
        Commencer à jouer
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-creation-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
}

.title {
  color: var(--primary-color);
  font-family: var(--font-game);
  font-size: 1.8rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.title-icon {
  color: var(--secondary-color);
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.username-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1.1rem;
  border: 2px solid var(--text-secondary);
  border-radius: var(--border-radius);
  background: var(--card-background);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.username-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.create-button {
  background: var(--primary-color);
  color: white;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.create-button:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .user-creation-container {
    margin: 1rem;
    padding: 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }
}
</style>
