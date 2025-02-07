"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WordValidator_1 = require("../../src/utils/WordValidator");
describe('WordValidator', () => {
    const gridSize = 4;
    let testGrid;
    beforeEach(() => {
        testGrid = {
            letters: [
                ['M', 'A', 'I', 'S'],
                ['O', 'U', 'R', 'E'],
                ['T', 'N', 'E', 'Z'],
                ['S', 'P', 'A', 'R']
            ]
        };
    });
    describe('Validation du dictionnaire français', () => {
        it('devrait accepter un mot français valide qui existe dans la grille', () => {
            expect((0, WordValidator_1.validateWord)('mais', gridSize, testGrid)).toBe(true);
            expect((0, WordValidator_1.validateWord)('par', gridSize, testGrid)).toBe(true);
        });
        it('devrait rejeter un mot qui n\'existe pas dans le dictionnaire français', () => {
            expect((0, WordValidator_1.validateWord)('xyz', gridSize, testGrid)).toBe(false);
            expect((0, WordValidator_1.validateWord)('maisz', gridSize, testGrid)).toBe(false);
        });
        it('devrait être insensible à la casse', () => {
            expect((0, WordValidator_1.validateWord)('MAIS', gridSize, testGrid)).toBe(true);
            expect((0, WordValidator_1.validateWord)('Mais', gridSize, testGrid)).toBe(true);
        });
    });
    describe('Validation de la grille', () => {
        it('devrait rejeter les mots de moins de 3 lettres', () => {
            expect((0, WordValidator_1.validateWord)('ma', gridSize, testGrid)).toBe(false);
        });
        it('devrait rejeter les mots plus longs que la taille maximale possible', () => {
            expect((0, WordValidator_1.validateWord)('maisonnette', gridSize, testGrid)).toBe(false);
        });
        it('devrait valider les mots qui peuvent être formés dans la grille', () => {
            expect((0, WordValidator_1.validateWord)('mots', gridSize, testGrid)).toBe(true);
            expect((0, WordValidator_1.validateWord)('tour', gridSize, testGrid)).toBe(true);
        });
        it('devrait rejeter les mots qui ne peuvent pas être formés dans la grille', () => {
            expect((0, WordValidator_1.validateWord)('maison', gridSize, testGrid)).toBe(false);
            expect((0, WordValidator_1.validateWord)('route', gridSize, testGrid)).toBe(false);
        });
    });
    let grid;
    beforeEach(() => {
        // Initialiser une grille de test 4x4
        grid = {
            letters: [
                ['A', 'B', 'C', 'D'],
                ['E', 'F', 'G', 'H'],
                ['I', 'J', 'K', 'L'],
                ['M', 'N', 'O', 'P']
            ]
        };
    });
    test('devrait rejeter les mots de moins de 3 lettres', () => {
        expect((0, WordValidator_1.validateWord)('AB', gridSize, grid)).toBe(false);
    });
    test('devrait rejeter les mots plus longs que la taille de la grille au carré', () => {
        expect((0, WordValidator_1.validateWord)('ABCDEFGHIJKLMNOPQ', gridSize, grid)).toBe(false);
    });
    test('devrait valider un mot horizontal', () => {
        expect((0, WordValidator_1.validateWord)('ABC', gridSize, grid)).toBe(true);
    });
    test('devrait valider un mot vertical', () => {
        expect((0, WordValidator_1.validateWord)('AEI', gridSize, grid)).toBe(true);
    });
    test('devrait valider un mot diagonal', () => {
        expect((0, WordValidator_1.validateWord)('AFK', gridSize, grid)).toBe(true);
    });
    test('devrait rejeter un mot non adjacent', () => {
        expect((0, WordValidator_1.validateWord)('ACK', gridSize, grid)).toBe(false);
    });
    test('devrait rejeter un mot qui n\'existe pas dans la grille', () => {
        expect((0, WordValidator_1.validateWord)('XYZ', gridSize, grid)).toBe(false);
    });
    test('devrait valider un mot en zigzag', () => {
        expect((0, WordValidator_1.validateWord)('AFJE', gridSize, grid)).toBe(true);
    });
    test('ne devrait pas permettre de réutiliser la même cellule', () => {
        const smallGrid = {
            letters: [
                ['A', 'A'],
                ['A', 'A']
            ]
        };
        expect((0, WordValidator_1.validateWord)('AAA', 2, smallGrid)).toBe(true);
        expect((0, WordValidator_1.validateWord)('AAAA', 2, smallGrid)).toBe(true);
        expect((0, WordValidator_1.validateWord)('AAAAA', 2, smallGrid)).toBe(false);
    });
});
