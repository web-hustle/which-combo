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

export type Player = {
    uid: string;
    nickname: string;
    isReady: boolean;
    board: BoardState;
    score: number;
    completedLines: string[];
    currentSequenceIndex: number;
    currentCards?: number[];
};

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

export const INITIAL_PLAYER_STATE: Player = {
    uid: "",
    nickname: "",
    isReady: false,
    board: Array(25).fill(0),
    score: 0,
    completedLines: [],
    currentSequenceIndex: 0,
};

// for 편의성

export interface CellType {
    value: number;
    status: "default" | "disabled" | "selected";
}