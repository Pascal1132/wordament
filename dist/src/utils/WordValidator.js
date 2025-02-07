"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWord = validateWord;
exports.calculateWordPoints = calculateWordPoints;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Charger le dictionnaire français
const frenchDictionary = new Set();
try {
    const dictionaryPath = path.join(__dirname, '..', 'fr.txt');
    const words = fs.readFileSync(dictionaryPath, 'utf8').split('\n');
    words.forEach(word => frenchDictionary.add(word.trim().toLowerCase()));
}
catch (error) {
    console.error('Erreur lors du chargement du dictionnaire français:', error);
}
function isWordInDictionary(word) {
    return frenchDictionary.has(word.toLowerCase());
}
function validateWord(word, gridSize, grid) {
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
    const visited = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));
    // Helper function to check if a position is valid
    const isValid = (x, y) => {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize && !visited[x][y];
    };
    // Helper function for DFS search
    const findWord = (x, y, index) => {
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
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
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
function calculateWordPoints(word, gridSize, grid) {
    const wordPoints = word.length;
    const wordMultiplier = 1;
    const letterMultipliers = word.split('').map(letter => {
        const letterMultiplier = 1;
        return letterMultiplier;
    });
    const totalPoints = wordPoints * wordMultiplier * letterMultipliers.reduce((a, b) => a * b, 1);
    return totalPoints;
}
