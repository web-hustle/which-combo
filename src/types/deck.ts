// src/types/deck.ts

export type PatternType = 'row' | 'col' | 'diag-main' | 'diag-cross';

export interface DeckPattern {
    id: string;        // 고유 ID (예: "r-0-0")
    type: PatternType; // 시각적 구분을 위한 타입
    indices: number[]; // 실제 보드 인덱스 (0~24)
    label: string;     // UI 표시용 이름 (옵션)
}

/**
 * 5x5 보드, 4칸 연속 선택 가능한 모든 경우의 수 (총 28개)
 * ID 규칙: {type}-{startY}-{startX}
 */
export const ALL_PATTERNS: DeckPattern[] = [
    // ------------------------------------------------
    // 1. 가로 (Rows) - 각 줄당 2개씩 * 5줄 = 10개
    // ------------------------------------------------
    { id: 'r-0-0', type: 'row', indices: [0, 1, 2, 3], label: 'Row 1 Left' },
    { id: 'r-0-1', type: 'row', indices: [1, 2, 3, 4], label: 'Row 1 Right' },

    { id: 'r-1-0', type: 'row', indices: [5, 6, 7, 8], label: 'Row 2 Left' },
    { id: 'r-1-1', type: 'row', indices: [6, 7, 8, 9], label: 'Row 2 Right' },

    { id: 'r-2-0', type: 'row', indices: [10, 11, 12, 13], label: 'Row 3 Left' },
    { id: 'r-2-1', type: 'row', indices: [11, 12, 13, 14], label: 'Row 3 Right' },

    { id: 'r-3-0', type: 'row', indices: [15, 16, 17, 18], label: 'Row 4 Left' },
    { id: 'r-3-1', type: 'row', indices: [16, 17, 18, 19], label: 'Row 4 Right' },

    { id: 'r-4-0', type: 'row', indices: [20, 21, 22, 23], label: 'Row 5 Left' },
    { id: 'r-4-1', type: 'row', indices: [21, 22, 23, 24], label: 'Row 5 Right' },

    // ------------------------------------------------
    // 2. 세로 (Cols) - 각 열당 2개씩 * 5열 = 10개
    // ------------------------------------------------
    { id: 'c-0-0', type: 'col', indices: [0, 5, 10, 15], label: 'Col 1 Top' },
    { id: 'c-1-0', type: 'col', indices: [5, 10, 15, 20], label: 'Col 1 Bottom' }, // startY=1

    { id: 'c-0-1', type: 'col', indices: [1, 6, 11, 16], label: 'Col 2 Top' },
    { id: 'c-1-1', type: 'col', indices: [6, 11, 16, 21], label: 'Col 2 Bottom' },

    { id: 'c-0-2', type: 'col', indices: [2, 7, 12, 17], label: 'Col 3 Top' },
    { id: 'c-1-2', type: 'col', indices: [7, 12, 17, 22], label: 'Col 3 Bottom' },

    { id: 'c-0-3', type: 'col', indices: [3, 8, 13, 18], label: 'Col 4 Top' },
    { id: 'c-1-3', type: 'col', indices: [8, 13, 18, 23], label: 'Col 4 Bottom' },

    { id: 'c-0-4', type: 'col', indices: [4, 9, 14, 19], label: 'Col 5 Top' },
    { id: 'c-1-4', type: 'col', indices: [9, 14, 19, 24], label: 'Col 5 Bottom' },

    // ------------------------------------------------
    // 3. 대각선 ↘ (Main Diag) - 4개
    // ------------------------------------------------
    // (0,0) 시작
    { id: 'dm-0-0', type: 'diag-main', indices: [0, 6, 12, 18], label: 'Diag Main 1' },
    // (0,1) 시작
    { id: 'dm-0-1', type: 'diag-main', indices: [1, 7, 13, 19], label: 'Diag Main 2' },
    // (1,0) 시작
    { id: 'dm-1-0', type: 'diag-main', indices: [5, 11, 17, 23], label: 'Diag Main 3' },
    // (1,1) 시작 (정중앙 통과)
    { id: 'dm-1-1', type: 'diag-main', indices: [6, 12, 18, 24], label: 'Diag Main 4' },

    // ------------------------------------------------
    // 4. 역대각선 ↙ (Cross Diag) - 4개
    // ------------------------------------------------
    // (0,3) 시작
    { id: 'dc-0-3', type: 'diag-cross', indices: [3, 7, 11, 15], label: 'Diag Cross 1' },
    // (0,4) 시작
    { id: 'dc-0-4', type: 'diag-cross', indices: [4, 8, 12, 16], label: 'Diag Cross 2' },
    // (1,3) 시작
    { id: 'dc-1-3', type: 'diag-cross', indices: [8, 12, 16, 20], label: 'Diag Cross 3' },
    // (1,4) 시작
    { id: 'dc-1-4', type: 'diag-cross', indices: [9, 13, 17, 21], label: 'Diag Cross 4' },
];

// Helper: ID로 패턴 찾기
export const getPatternById = (id: string) => ALL_PATTERNS.find(p => p.id === id);