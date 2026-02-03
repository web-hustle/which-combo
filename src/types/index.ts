import { ALL_PATTERNS } from "./deck";

export type GameStatus = "waiting" | "placing" | "battle" | "finished" | "result_check";

export type PlayerRole = "host" | "guest" | "spectator";

export type BoardState = number[];

export interface HandResult {
    score: number;
    rank: string;
    highlight: number[];
}

export type HandRank =
    | "Quad"
    | "RoyalSt"
    | "Straight"
    | "TwoPair"
    | "Triple"
    | "OnePair"
    | "HighCard";

export interface HandAnalysis {
    cards: number[];      // 실제 냈던 카드 4장 (예: [10, 10, 9, 2])
    score: number;        // 계산된 점수 (예: 32009)
    rank: string;         // 족보 이름 (예: "Two Pair")
    highlight: number[];  // 강조할 숫자들 (예: [10, 10])
}

export interface RoomData {
    roomId: string;
    status: GameStatus;
    host: Player;
    guest?: Player | null;
    numberSequence: number[];
    turnCount: number;
    winner?: "host" | "guest" | "draw";
    lastResult?: {
        hostHand: HandAnalysis;
        guestHand: HandAnalysis;
        winner: "host" | "guest" | "draw";
    };
}

export interface CellInfo {
    card: number;
    boardIndex: number;
}

export type Player = {
    uid: string;
    nickname: string;
    isReady: boolean;
    board: BoardState;
    score: number;
    completedLines: string[];
    currentSequenceIndex: number;
    currentCards?: number[];
    lastPlacedCard?: CellInfo;
};

export interface CellType {
    value: number;
    status: "default" | "disabled" | "selected";
}

export const findPatternByIndices = (indices: number[]) => {
    // 1. 방어 코드: 4개가 아니면 패턴일 리가 없음
    if (!indices || indices.length !== 4) return undefined;

    // 2. 비교를 위해 유저의 입력을 오름차순 정렬 후 문자열로 변환
    // 예: [3, 0, 2, 1] -> [0, 1, 2, 3] -> "0,1,2,3"
    const sortedTarget = [...indices].sort((a, b) => a - b).join(',');

    // 3. 28개의 족보를 순회하며 같은 구성인지 찾음
    return ALL_PATTERNS.find(pattern => {
        // 족보도 혹시 모르니 정렬해서 비교 (데이터가 정렬되어 있다면 생략 가능하지만 안전하게)
        const sortedPattern = [...pattern.indices].sort((a, b) => a - b).join(',');

        return sortedTarget === sortedPattern;
    });
};