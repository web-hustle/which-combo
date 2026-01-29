import { ref, update, get } from "firebase/database";
import { db } from "../firebase";
import type { RoomData } from "../types/index";

export const useGameLogic = (
    roomId: string,
    myId: string,
    roomData: RoomData | null
) => {
    // 1. 게임 시작 (Host)
    const startGame = async () => {
        if (!roomId || !roomData) return;

        // 25개 난수 생성
        const sequence = Array.from(
            { length: 25 },
            () => Math.floor(Math.random() * 10) + 1
        );

        await update(ref(db, `rooms/${roomId}`), {
            status: "placing",
            numberSequence: sequence,
            // 양쪽 플레이어 상태 초기화
            "host/board": Array(25).fill(0),
            "host/currentSequenceIndex": 0, // 호스트 0번부터

            "guest/board": Array(25).fill(0),
            "guest/currentSequenceIndex": 0, // 게스트 0번부터
        });
    };

    // 2. 숫자 배치 (비동기 방식)
    const placeNumber = async (boardIndex: number) => {
        console.log(0);
        if (!roomData || !roomData.numberSequence) return;

        const isHost = roomData.host.uid === myId;
        const myRole = isHost ? "host" : "guest";
        const myData = isHost ? roomData.host : roomData.guest;

        if (!myData) return;

        // 이미 배치 끝난 사람이 또 눌렀을 때 방어
        if (myData.currentSequenceIndex >= 25) return;

        // 내가 지금 놓아야 할 숫자 (내 인덱스 기준)
        const targetNumber = roomData.numberSequence[myData.currentSequenceIndex];
        const nextIndex = myData.currentSequenceIndex + 1;

        // [중요] 내 상태만 업데이트 (Board + Index)
        const updates: any = {};
        updates[`rooms/${roomId}/${myRole}/board/${boardIndex}`] = targetNumber;
        updates[`rooms/${roomId}/${myRole}/currentSequenceIndex`] = nextIndex;

        await update(ref(db), updates);
        // 3. 게임 단계 전환 체크 (모두 완료했는가?)
        checkAllReady(myRole, nextIndex);
    };

    // 내부 함수: 둘 다 25개를 채웠는지 확인
    const checkAllReady = async (myRole: string, myNextIndex: number) => {
        // 내 인덱스가 25가 아니면 굳이 상대방 확인할 필요 없음
        if (myNextIndex < 25) return;

        // 나는 다 채웠음. 이제 상대방 확인
        const opponentRole = myRole === "host" ? "guest" : "host";
        const snapshot = await get(
            ref(db, `rooms/${roomId}/${opponentRole}/currentSequenceIndex`)
        );
        const opponentIndex = snapshot.val();

        // 상대방도 25라면 -> 배틀 시작!
        if (opponentIndex >= 25) {
            await update(ref(db, `rooms/${roomId}`), { status: "battle" });
        }
    };

    return { startGame, placeNumber };
};