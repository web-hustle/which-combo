export type GameStatus = "waiting" | "placing" | "battle" | "finished";

export type PlayerRole = "host" | "guest" | "spectator";

export type BoardState = number[];

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
};

export interface RoomData {
    roomId: string;
    status: GameStatus;
    host: Player;
    guest?: Player | null;
    numberSequence: number[];
    turnCount: number;
    winner?: "host" | "guest" | "draw";
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