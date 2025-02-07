"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GridCreator_1 = __importDefault(require("../../src/utils/GridCreator"));
describe('GridCreator', () => {
    describe('createGrid', () => {
        it('devrait créer une grille de la taille spécifiée', () => {
            const size = 4;
            const grid = GridCreator_1.default.createGrid(size);
            expect(grid.letters).toHaveLength(size);
            grid.letters.forEach(row => {
                expect(row).toHaveLength(size);
            });
        });
        it('devrait lever une erreur si la taille est inférieure à 2', () => {
            expect(() => {
                GridCreator_1.default.createGrid(1);
            }).toThrow('La taille de la grille doit être d\'au moins 2x2');
        });
        it('devrait générer une grille avec des lettres valides', () => {
            const size = 4;
            const grid = GridCreator_1.default.createGrid(size);
            const allLetters = grid.letters.flat();
            allLetters.forEach(letter => {
                expect(letter).toMatch(/^[A-Z]$/);
            });
        });
        it('devrait générer des grilles différentes à chaque appel', () => {
            const size = 4;
            const grid1 = GridCreator_1.default.createGrid(size);
            const grid2 = GridCreator_1.default.createGrid(size);
            // Compare les chaînes JSON des grilles
            const areGridsEqual = JSON.stringify(grid1) === JSON.stringify(grid2);
            expect(areGridsEqual).toBeFalsy();
        });
    });
});
