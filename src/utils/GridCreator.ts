import { Grid } from '../types/game.types';

class GridCreator {
  // Fréquences approximatives des lettres en français (en pourcentage)
  private static readonly LETTER_FREQUENCIES: { [key: string]: number } = {
    'E': 14.7,
    'A': 7.6,
    'I': 7.5,
    'S': 7.9,
    'N': 7.1,
    'R': 6.5,
    'T': 7.2,
    'O': 5.4,
    'L': 5.5,
    'U': 6.3,
    'D': 3.7,
    'C': 3.3,
    'M': 2.9,
    'P': 2.9,
    'G': 1.0,
    'B': 0.9,
    'V': 1.6,
    'H': 0.7,
    'F': 1.1,
    'Q': 1.4,
    'Y': 0.3,
    'X': 0.4,
    'J': 0.3,
    'K': 0.1,
    'W': 0.1,
    'Z': 0.1
  };

  private static readonly LETTERS = Object.keys(GridCreator.LETTER_FREQUENCIES);
  private static readonly TOTAL_WEIGHT = Object.values(GridCreator.LETTER_FREQUENCIES).reduce((a, b) => a + b, 0);

  /**
   * Crée une grille de taille n x n avec une distribution des lettres proche du français
   * @param size - La taille de la grille (n x n)
   * @returns Une grille de lettres
   */
  public static createGrid(size: number): Grid {
    if (size < 2) {
      throw new Error('La taille de la grille doit être d\'au moins 2x2');
    }

    const grid: string[][] = [];

    // Initialiser la grille vide
    for (let i = 0; i < size; i++) {
      grid[i] = new Array(size);
    }

    // Remplir la grille
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        grid[i][j] = this.getWeightedRandomLetter();
      }
    }

    return { letters: grid };
  }

  /**
   * Retourne une lettre aléatoire selon la distribution de fréquence du français
   * @returns Une lettre aléatoire
   */
  private static getWeightedRandomLetter(): string {
    const random = Math.random() * this.TOTAL_WEIGHT;
    let weightSum = 0;
    
    for (const letter of this.LETTERS) {
      weightSum += this.LETTER_FREQUENCIES[letter];
      if (random <= weightSum) {
        return letter;
      }
    }
    
    return 'E'; // Fallback sur la lettre la plus commune
  }
}

export default GridCreator;
