<template>
  <div class="game-container card fade-in">
    <h2 class="game-title">
      <font-awesome-icon icon="dice" class="title-icon" />
      Grille de jeu
    </h2>
    <div
      v-if="grid"
      class="grid-container"
      @mousedown="startSelection"
      @mousemove="updateSelection"
      @mouseup="endSelection"
      @mouseleave="endSelection"
      @touchstart="startSelection"
      @touchmove="updateSelection"
      @touchend="endSelection"
    >
      <div v-for="(row, rowIndex) in grid.letters" :key="rowIndex" class="row">
        <div
          v-for="(letter, columnIndex) in row"
          :key="columnIndex"
          class="cell"
          :class="{
            'selected': selectedCells.has(`${rowIndex}-${columnIndex}`),
            'last-selected': isLastSelected(rowIndex, columnIndex)
          }"
          :data-row="rowIndex"
          :data-col="columnIndex"
        >
          {{ letter }}
          <div class="cell-highlight"></div>
        </div>
      </div>
    </div>
    <div v-if="props.error" class="word-validating-error">
      <p>{{ props.error.word }} n'est pas un mot valide</p>
    </div>
  </div>
</template>


<script setup lang="ts">
import type { Grid, WordValidatingError } from '../types/game';
import { ref, computed, watch } from 'vue';
import { useGsap } from '../composables/useGsap';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDice } from '@fortawesome/free-solid-svg-icons';
import { useGame } from '../composables/useGame';

library.add(faDice);

const props = defineProps<{
  grid: Grid;
  error: WordValidatingError | false;
}>();

const emit = defineEmits<{
  (event: 'onWordSelect', word: string): void
}>();

const { currentPlayerWords, currentGame } = useGame();
const { gsap } = useGsap();

const isSelecting = ref(false);
const selectedCells = ref<Set<string>>(new Set());
const lastCell = ref<{ row: number; col: number } | null>(null);

const isLastSelected = (row: number, col: number) => {
  return lastCell.value?.row === row && lastCell.value?.col === col;
};

const isAdjacent = (row1: number, col1: number, row2: number, col2: number) => {
  const rowDiff = Math.abs(row1 - row2);
  const colDiff = Math.abs(col1 - col2);
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
};

const startSelection = (e: MouseEvent | TouchEvent) => {
  e.preventDefault();

  const cell = (e instanceof MouseEvent ? e.target : e.touches[0].target as any).closest('.cell');
  if (!cell) return;

  // Retour haptique si disponible
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  isSelecting.value = true;
  selectedCells.value.clear();
  const row = parseInt(cell.getAttribute('data-row') || '0');
  const col = parseInt(cell.getAttribute('data-col') || '0');
  selectedCells.value.add(`${row}-${col}`);
  lastCell.value = { row, col };
};

const updateSelection = (e: MouseEvent | TouchEvent) => {
  e.preventDefault();
  if (!isSelecting.value || !lastCell.value) return;

  const cell = (e instanceof MouseEvent ? e.target :
    document.elementFromPoint(
      e.touches[0].clientX,
      e.touches[0].clientY
    )) as HTMLElement;

  const cellElement = cell?.closest('.cell');
  if (!cellElement) return;

  const row = parseInt(cellElement.getAttribute('data-row') || '0');
  const col = parseInt(cellElement.getAttribute('data-col') || '0');

  if (isAdjacent(lastCell.value.row, lastCell.value.col, row, col)) {
    const cellKey = `${row}-${col}`;
    if (!selectedCells.value.has(cellKey)) {
      selectedCells.value.add(cellKey);
      lastCell.value = { row, col };
      // Petit retour haptique lors de l'ajout d'une nouvelle lettre
      if (navigator.vibrate) {
        navigator.vibrate(25);
      }
    }
  }
};

const endSelection = () => {
  if (!isSelecting.value) return;

  const selectedWord = getSelectedWord();
  if (selectedWord) {
    emit('onWordSelect', selectedWord);
    // Retour haptique plus long pour la validation d'un mot
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }

  isSelecting.value = false;
  selectedCells.value.clear();
  lastCell.value = null;
};

const getSelectedWord = () => {
  let word = '';
  for (const cellKey of selectedCells.value) {
    const [row, col] = cellKey.split('-').map(Number);
    word += props.grid.letters[row][col];
  }
  return word;
};

const explodeGrid = () => {
  const cells = document.querySelectorAll('.cell');
  const timeline = gsap.timeline();
  const container = document.querySelector('.grid-container');

  // Effet de tremblement avant l'explosion
  timeline.to('.grid-container', {
    keyframes: [
      { rotate: -2, scale: 1.02, duration: 0.1 },
      { rotate: 2, scale: 1.04, duration: 0.1 },
      { rotate: -2, scale: 1.06, duration: 0.1 },
      { rotate: 2, scale: 1.08, duration: 0.1 },
      { rotate: 0, scale: 1.1, duration: 0.1 }
    ],
    ease: 'power2.inOut'
  });

  // Création de particules d'explosion
  const createParticles = () => {
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF0000'];
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'explosion-particle';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      container?.appendChild(particle);

      const angle = (Math.random() * Math.PI * 2);
      const velocity = 800 + Math.random() * 500;
      const x = Math.cos(angle) * velocity;
      const y = Math.sin(angle) * velocity;

      gsap.fromTo(particle,
        { scale: 0, opacity: 1, x: 0, y: 0 },
        {
          scale: 0.5 + Math.random(),
          opacity: 0,
          x: x,
          y: y,
          duration: 1 + Math.random(),
          ease: 'power2.out',
          onComplete: () => particle.remove()
        }
      );
    }
  };

  // Explosion des cellules
  cells.forEach((cell, index) => {
    const delay = index * 0.02;
    const angle = (index / cells.length) * Math.PI * 2;
    const distance = 1500 + Math.random() * 500;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    timeline.to(cell, {
      x: x,
      y: y,
      rotationX: 'random(-720, 720)',
      rotationY: 'random(-720, 720)',
      rotationZ: 'random(-720, 720)',
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'power4.out',
      delay: delay
    }, 0.3);
  });

  // Flash d'explosion
  const flash = document.createElement('div');
  flash.className = 'explosion-flash';
  container?.appendChild(flash);

  timeline.to(flash, {
    opacity: 0.9,
    duration: 0.2,
    ease: 'power1.in',
    onComplete: createParticles
  }, 0.3).to(flash, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => flash.remove()
  });

  return timeline.then(() => {
    // Retourne une promesse qui se résout quand l'animation est terminée
    return new Promise(resolve => setTimeout(resolve, 100));
  });
};

// Surveiller le statut du jeu pour déclencher l'explosion
watch(() => currentGame.value?.status, async (newStatus, oldStatus) => {
  if (newStatus === 'finished' && oldStatus === 'running') {
    // On attend que l'animation soit terminée avant de laisser Vue mettre à jour l'interface
    await explodeGrid();
  }
});

// Ajout des styles pour les particules
const style = document.createElement('style');
style.textContent = `
  .explosion-particle {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 1000;
  }
`;
document.head.appendChild(style);
</script>


<style scoped>
.game-container {
  margin: 1rem 0;
  width: 100%;
  padding: 0.5rem;
}

.game-title {
  text-align: center;
  margin-bottom: 1rem;
  color: var(--primary-color);
  font-family: var(--font-game);
  font-size: clamp(1.2rem, 4vw, 2rem);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  color: var(--secondary-color);
}

.game-layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.grid-container {
  user-select: none;
  touch-action: none;
  width: 100%;
  padding: 1rem;
  background: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.grid-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(236, 72, 153, 0.1) 50%,
    rgba(139, 92, 246, 0.1) 100%
  );
  z-index: 0;
}

.row {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  gap: 10px;
}

.cell {
  position: relative;
  width: min(15vw, 60px);
  height: min(15vw, 60px);
  font-size: clamp(1rem, 4vw, 1.5rem);
  color: var(--text-primary);
  border: 2px solid var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background: var(--card-background);
  border-radius: var(--border-radius);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform-origin: center;
  will-change: transform, opacity;
  backface-visibility: hidden;
  perspective: 1000px;
}

.cell-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center,
    rgba(99, 102, 241, 0.3) 0%,
    rgba(236, 72, 153, 0.3) 50%,
    rgba(139, 92, 246, 0.3) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cell:hover .cell-highlight {
  opacity: 1;
}

.cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.cell.selected {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
  animation: selectedPulse 1.5s infinite;
}

.cell.last-selected {
  animation: lastSelectedPulse 0.8s infinite;
}

@keyframes selectedPulse {
  0% {
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
  }
  50% {
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.8);
  }
  100% {
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
  }
}

@keyframes lastSelectedPulse {
  0% {
    box-shadow: 0 0 8px rgba(236, 72, 153, 0.6);
  }
  50% {
    box-shadow: 0 0 12px rgba(236, 72, 153, 0.8);
  }
  100% {
    box-shadow: 0 0 8px rgba(236, 72, 153, 0.6);
  }
}

.explosion-flash {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 200, 0, 0.8) 50%,
    rgba(255, 100, 0, 0.4) 100%
  );
  opacity: 0;
  pointer-events: none;
  border-radius: var(--border-radius);
  z-index: 100;
}

/* Responsive adjustments */
@media (max-width: 360px) {
  .cell {
    width: min(12vw, 50px);
    height: min(12vw, 50px);
    font-size: clamp(0.8rem, 3vw, 1.2rem);
    border-width: 1px;
  }

  .row {
    gap: 6px;
    margin-bottom: 6px;
  }

  .grid-container {
    padding: 0.5rem;
  }
}

@media (max-height: 480px) and (orientation: landscape) {
  .grid-container {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .row {
    gap: 6px;
    margin-bottom: 6px;
  }

  .cell {
    width: min(10vw, 45px);
    height: min(10vw, 45px);
    font-size: clamp(0.8rem, 2.5vw, 1.2rem);
  }

  .game-title {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .game-layout {
    flex-direction: column;
  }
}

.word-validating-error {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(220, 38, 38, 0.95);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
  z-index: 1000;
  text-align: center;
  backdrop-filter: blur(8px);
  animation: slideUp 0.3s ease-out forwards;
  width: 90%;
  max-width: 300px;
}

.word-validating-error p {
  margin: 0;
  font-weight: 500;
  font-size: 0.9rem;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .word-validating-error {
    padding: 0.5rem 1rem;
  }

  .word-validating-error p {
    font-size: 0.8rem;
  }
}
</style>

