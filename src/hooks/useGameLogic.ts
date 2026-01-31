

import { ref, update, get, set } from "firebase/database";
import { db } from "../firebase";
import type { RoomData } from "../types/index";
import { useEffect } from "react";

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

    const isHost = roomData?.host.uid === myId;

    // 2. 숫자 배치 (비동기 방식)
    const placeNumber = async (boardIndex: number) => {
        console.log(0);
        if (!roomData || !roomData.numberSequence) return;
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

    const submitCards = async (myRole: string, ids: number[]) => {
        console.log(`rooms/${roomId}/${myRole}/currentCards`, ids)
        await set(ref(db, `rooms/${roomId}/${myRole}/currentCards`), ids);
    };

    const doBattle = async () => {// optional chaining은 좋지만, 확실한 로직을 위해 존재 여부 체크
        if (!roomData || !roomData.guest || !isHost) return;
        const { host, guest } = roomData;

        const hostTurn = roomData.host.currentCards; // 변수명 Index -> Turn or Indices 추천
        const guestTurn = roomData.guest?.currentCards;

        if (hostTurn?.length === 4 && guestTurn?.length === 4) {
            const hostCards = hostTurn.map(idx => host.board[idx]);
            const guestCards = guestTurn.map(idx => guest.board[idx]);

            const hostPoint = calcPointOf(hostCards);
            const guestPoint = calcPointOf(guestCards);

            const roomRef = ref(db, `rooms/${roomId}`);
            const updates: any = {};

            if (hostPoint > guestPoint) {
                updates[`host/score`] = (roomData.host.score || 0) + 1;
            } else if (guestPoint > hostPoint) {
                updates[`guest/score`] = (roomData.guest.score || 0) + 1;
            } else {
            }

            // 공통 업데이트
            updates[`turnCount`] = (roomData.turnCount || 0) + 1;
            updates[`host/currentCards`] = null;
            updates[`guest/currentCards`] = null;

            // (선택) 결과 확인을 위해 lastResult 저장 추천
            updates[`lastResult`] = {
                hostCards,
                guestCards,
                winner: hostPoint > guestPoint ? 'host' : (guestPoint > hostPoint ? 'guest' : 'draw')
            };

            await update(roomRef, updates);
        }
    };

    const calcPointOf = (cards: number[]) => {
        if (!cards || cards.length !== 4) return 0;

        // 1. 계산용 정렬 (내림차순: 9, 8, 2, 1)
        const sorted = [...cards].sort((a, b) => b - a);

        // 2. 로티플 체크를 위한 원본 순서 연속성 확인 (오름차순 or 내림차순)
        // (doBattle에서 인덱스 순서대로 값을 가져오므로, 유저가 선택한 순서가 유지됨)
        const isSequentialRaw = (arr: number[]) => {
            for (let i = 0; i < arr.length - 1; i++) if (Math.abs(arr[i] - arr[i + 1]) !== 1) return false;
            return true;
        };
        const isRotifle = isSequentialRaw(cards);

        if (isRotifle) {
            return 70000 + Math.max(...cards);
        }

        // 3. 빈도수 분석
        const counts: Record<number, number> = {};
        sorted.forEach(n => counts[n] = (counts[n] || 0) + 1);

        // [ {num:10, count:2}, {num:9, count:2} ] 형태로 변환 후 정렬
        const pattern = Object.entries(counts)
            .map(([num, count]) => ({ num: Number(num), count }))
            .sort((a, b) => b.count - a.count || b.num - a.num);

        const mainNum = pattern[0].num;     // 가장 많은 숫자 (또는 큰 숫자)
        const maxCount = pattern[0].count;  // 그 숫자의 개수

        // --- 족보 판별 ---

        // 포카드
        if (maxCount === 4) return 60000 + mainNum;

        // 스트레이트 (정렬된 상태에서 연속)
        const isStraight = (sorted[0] - sorted[1] === 1) &&
            (sorted[1] - sorted[2] === 1) &&
            (sorted[2] - sorted[3] === 1);
        if (isStraight) return 50000 + sorted[0];

        // 트리플 (킥커 무시)
        if (maxCount === 3) return 40000 + mainNum;

        // 투페어 (요청사항: 10,10,9,9 > 10,10,2,2)
        if (maxCount === 2 && pattern[1].count === 2) {
            const bigPair = pattern[0].num;   // 정렬했으므로 0번이 무조건 큰 페어
            const smallPair = pattern[1].num; // 1번이 작은 페어
            // 큰 페어에 가중치 100을 줘서 압도하게 만듦
            return 30000 + (bigPair * 100) + smallPair;
        }

        // 원페어 (킥커 무시: 10,10,5,2 == 10,10,5,3)
        if (maxCount === 2) return 20000 + mainNum;

        // 하이카드 (킥커 무시, 가장 높은 숫자만 봄)
        return 10000 + sorted[0];
    };

    useEffect(() => {
        doBattle();
    }, [roomData]);

    return { startGame, placeNumber, submitCards };
};