import { validateWord } from '../../src/utils/WordValidator';
import { Grid } from '../../src/types/game.types';

describe('WordValidator', () => {
    const gridSize = 4;
    let testGrid: Grid;

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
            expect(validateWord('mais', gridSize, testGrid)).toBe(true);
            expect(validateWord('par', gridSize, testGrid)).toBe(true);
        });

        it('devrait rejeter un mot qui n\'existe pas dans le dictionnaire français', () => {
            expect(validateWord('xyz', gridSize, testGrid)).toBe(false);
            expect(validateWord('maisz', gridSize, testGrid)).toBe(false);
        });

        it('devrait être insensible à la casse', () => {
            expect(validateWord('MAIS', gridSize, testGrid)).toBe(true);
            expect(validateWord('Mais', gridSize, testGrid)).toBe(true);
        });
    });

    describe('Validation de la grille', () => {
        it('devrait rejeter les mots de moins de 3 lettres', () => {
            expect(validateWord('ma', gridSize, testGrid)).toBe(false);
        });

        it('devrait rejeter les mots plus longs que la taille maximale possible', () => {
            expect(validateWord('maisonnette', gridSize, testGrid)).toBe(false);
        });

        it('devrait valider les mots qui peuvent être formés dans la grille', () => {
            expect(validateWord('mots', gridSize, testGrid)).toBe(true);
            expect(validateWord('tour', gridSize, testGrid)).toBe(true);
        });

        it('devrait rejeter les mots qui ne peuvent pas être formés dans la grille', () => {
            expect(validateWord('maison', gridSize, testGrid)).toBe(false);
            expect(validateWord('route', gridSize, testGrid)).toBe(false);
        });
    });

    let grid: Grid;

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
        expect(validateWord('AB', gridSize, grid)).toBe(false);
    });

    test('devrait rejeter les mots plus longs que la taille de la grille au carré', () => {
        expect(validateWord('ABCDEFGHIJKLMNOPQ', gridSize, grid)).toBe(false);
    });

    test('devrait valider un mot horizontal', () => {
        expect(validateWord('ABC', gridSize, grid)).toBe(true);
    });

    test('devrait valider un mot vertical', () => {
        expect(validateWord('AEI', gridSize, grid)).toBe(true);
    });

    test('devrait valider un mot diagonal', () => {
        expect(validateWord('AFK', gridSize, grid)).toBe(true);
    });

    test('devrait rejeter un mot non adjacent', () => {
        expect(validateWord('ACK', gridSize, grid)).toBe(false);
    });

    test('devrait rejeter un mot qui n\'existe pas dans la grille', () => {
        expect(validateWord('XYZ', gridSize, grid)).toBe(false);
    });

    test('devrait valider un mot en zigzag', () => {
        expect(validateWord('AFJE', gridSize, grid)).toBe(true);
    });

    test('ne devrait pas permettre de réutiliser la même cellule', () => {
        const smallGrid: Grid = {
            letters: [
                ['A', 'A'],
                ['A', 'A']
            ]
        };
        expect(validateWord('AAA', 2, smallGrid)).toBe(true);
        expect(validateWord('AAAA', 2, smallGrid)).toBe(true);
        expect(validateWord('AAAAA', 2, smallGrid)).toBe(false);
    });
}); 