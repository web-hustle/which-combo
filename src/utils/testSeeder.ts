// src/utils/testSeeder.ts
import { ref, set } from "firebase/database";
import { db } from "../firebase";
import type { RoomData } from "../types/index";

// 1~10 랜덤 숫자 생성기
const getRandomNum = () => Math.floor(Math.random() * 10) + 1;

// 25개 랜덤 배열 생성기
const generateSequence = () => Array.from({ length: 25 }, getRandomNum);

export const forceBattleState = async (roomId: string, hostId: string) => {
    const sequence = generateSequence();

    const guestId = "test_guest_" + Math.random().toString(36).substr(2, 5);

    // 3. Host와 Guest의 보드를 꽉 채운 상태로 만듦
    // (테스트 편의를 위해 sequence 순서대로 넣되, 약간 섞거나 그대로 넣음)
    const hostBoard = [...sequence]; // 호스트는 정석대로 넣음
    const guestBoard = [...sequence].reverse(); // 게스트는 거꾸로 넣음 (승부 나게)

    const mockData: RoomData = {
        roomId,
        status: "battle",
        numberSequence: sequence,
        turnCount: 0,

        host: {
            uid: hostId,
            nickname: "Dev_Host",
            isReady: true,
            score: 0,
            board: hostBoard,
            currentSequenceIndex: 25,
            completedLines: [],
        },
        guest: {
            uid: guestId,
            nickname: "Dev_Guest_Bot",
            isReady: true,
            score: 0,
            board: guestBoard,
            currentSequenceIndex: 25,
            completedLines: [],
        },
    };

    // DB 덮어쓰기
    await set(ref(db, `rooms/${roomId}`), mockData);
};