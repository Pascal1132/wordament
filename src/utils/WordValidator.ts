import { Grid } from "types/game.types";
import * as fs from 'fs';
import * as path from 'path';

// Charger le dictionnaire français
const frenchDictionary = new Set<string>();
try {
    const dictionaryPath = path.join(__dirname, '..', 'fr.txt');
    const words = fs.readFileSync(dictionaryPath, 'utf8').split('\n');
    words.forEach(word => frenchDictionary.add(word.trim().toLowerCase()));
} catch (error) {
    console.error('Erreur lors du chargement du dictionnaire français:', error);
}

function isWordInDictionary(word: string): boolean {
    return frenchDictionary.has(word.toLowerCase());
}

export function validateWord(word: string, gridSize: number, grid: Grid): boolean {
    // Vérifier d'abord si le mot existe dans le dictionnaire
    if (!isWordInDictionary(word)) {
        return false;
    }

    if (word.length < 3) {
        return false;
    }

    if (word.length > gridSize * gridSize) {
        return false;
    }

    // check if the word is in the grid (horizontal, vertical, diagonal next to each other using algo dijkstra)
    const gridLetters = grid.letters;
    const wordLetters = word.split('');

    // check if the word is in the grid (horizontal, vertical, diagonal next to each other using algo dijkstra)
    // Create a visited array to track visited cells
    const visited: boolean[][] = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));

    // Helper function to check if a position is valid
    const isValid = (x: number, y: number): boolean => {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize && !visited[x][y];
    };

    // Helper function for DFS search
    const findWord = (x: number, y: number, index: number): boolean => {
        // If we've found all letters, return true
        if (index === wordLetters.length) {
            return true;
        }

        // If current position is invalid or letter doesn't match, return false
        if (!isValid(x, y) || gridLetters[x][y] !== wordLetters[index]) {
            return false;
        }

        // Mark current cell as visited
        visited[x][y] = true;

        // Check all 8 adjacent cells
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (findWord(newX, newY, index + 1)) {
                return true;
            }
        }

        // Backtrack
        visited[x][y] = false;
        return false;
    };

    // Try starting from each cell in the grid
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (gridLetters[i][j] === wordLetters[0]) {
                // Reset visited array for each new starting position
                visited.forEach(row => row.fill(false));
                if (findWord(i, j, 0)) {
                    return true;
                }
            }
        }
    }

    return false;
}

export function calculateWordPoints(word: string, gridSize: number, grid: Grid) {
    const wordPoints = word.length;
    const wordMultiplier = 1;
    const letterMultipliers = word.split('').map(letter => {
        const letterMultiplier = 1;
        return letterMultiplier;
    });
    const totalPoints = wordPoints * wordMultiplier * letterMultipliers.reduce((a, b) => a * b, 1);
    return totalPoints;
}

