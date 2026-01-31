

import { ref, update, get, set } from "firebase/database";
import { db } from "../firebase";
import { findPatternByIndices, type HandResult, type RoomData } from "../types/index";
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

    const doBattle = async () => {
        // 1. 방어 로직 (기존 동일)
        if (!roomData || !roomData.guest || !isHost) return;
        // 🔥 [핵심] 이미 결과 확인 중이면 배틀 로직 또 돌지 않게 막기
        if (roomData.status !== 'battle') return;

        const { host, guest } = roomData;
        const hostTurn = host.currentCards;
        const guestTurn = guest.currentCards;

        // 2. 카드 존재 확인 (기존 동일)
        if (hostTurn?.length === 4 && guestTurn?.length === 4) {
            const hostCards = hostTurn.map(idx => host.board[idx]);
            const guestCards = guestTurn.map(idx => guest.board[idx]);

            const roomRef = ref(db, `rooms/${roomId}`);
            const hostResult = calcPointOf(hostCards);
            const guestResult = calcPointOf(guestCards);

            const hostPattern = findPatternByIndices(hostTurn);
            const guestPattern = findPatternByIndices(guestTurn);

            // 2. 기존 completedLines 가져오기
            const hostLines = roomData.host.completedLines || [];
            const guestLines = roomData.guest.completedLines || [];

            const updates: any = {};

            if (hostPattern) updates[`host/completedLines`] = [...hostLines, hostPattern.id];
            if (guestPattern) updates[`guest/completedLines`] = [...guestLines, guestPattern.id];

            // 점수 비교 (score 속성끼리 비교)
            if (hostResult.score > guestResult.score) {
                updates[`host/score`] = (host.score || 0) + 1;
            } else if (guestResult.score > hostResult.score) {
                updates[`guest/score`] = (guest.score || 0) + 1;
            }

            updates[`status`] = 'result_check';

            // 🔥 상세 정보를 다 저장합니다.
            updates[`lastResult`] = {
                winner: hostResult.score > guestResult.score ? 'host' : (guestResult.score > hostResult.score ? 'guest' : 'draw'),
                hostHand: { cards: hostCards, ...hostResult },
                guestHand: { cards: guestCards, ...guestResult }
            };

            await update(roomRef, updates);
        }
    };

    const calcPointOf = (cards: number[]): HandResult => {
        // 0. 예외 처리
        if (!cards || cards.length !== 4) {
            return { score: 0, rank: '', highlight: [] };
        }

        const sorted = [...cards].sort((a, b) => b - a);

        // 연속성 체크
        const isSequentialRaw = (arr: number[]) => {
            for (let i = 0; i < arr.length - 1; i++) if (Math.abs(arr[i] - arr[i + 1]) !== 1) return false;
            return true;
        };
        const isRotifle = isSequentialRaw(cards); // 원본 순서 기준

        // 빈도수 분석
        const counts: Record<number, number> = {};
        sorted.forEach(n => counts[n] = (counts[n] || 0) + 1);

        const pattern = Object.entries(counts)
            .map(([num, count]) => ({ num: Number(num), count }))
            .sort((a, b) => b.count - a.count || b.num - a.num);

        const mainNum = pattern[0].num;
        const maxCount = pattern[0].count;

        // 1. 로티플 (전체 강조)
        if (isRotifle) {
            return {
                score: 70000 + Math.max(...cards),
                rank: 'Rotifle',
                highlight: cards // 전체 강조
            };
        }

        // 2. 포카드 (해당 숫자만 강조)
        if (maxCount === 4) {
            return {
                score: 60000 + mainNum,
                rank: 'Four Card',
                highlight: [mainNum]
            };
        }

        // 3. 스트레이트 (전체 강조)
        const isStraight = (sorted[0] - sorted[1] === 1) && (sorted[1] - sorted[2] === 1) && (sorted[2] - sorted[3] === 1);
        if (isStraight) {
            return {
                score: 50000 + sorted[0],
                rank: 'Straight',
                highlight: cards // 전체 강조
            };
        }

        // 4. 트리플 (해당 숫자만 강조)
        if (maxCount === 3) {
            return {
                score: 40000 + mainNum,
                rank: 'Triple',
                highlight: [mainNum]
            };
        }

        // 5. 투페어 (두 페어 숫자 모두 강조)
        if (maxCount === 2 && pattern[1].count === 2) {
            const bigPair = pattern[0].num;
            const smallPair = pattern[1].num;
            return {
                score: 30000 + (bigPair * 100) + smallPair,
                rank: 'Two Pair',
                highlight: [bigPair, smallPair]
            };
        }

        // 6. 원페어 (페어 숫자만 강조)
        if (maxCount === 2) {
            return {
                score: 20000 + mainNum,
                rank: 'One Pair',
                highlight: [mainNum]
            };
        }

        // 7. 하이카드 (가장 높은 숫자 하나만 강조)
        return {
            score: 10000 + sorted[0],
            rank: 'High Card',
            highlight: [sorted[0]]
        };
    };

    useEffect(() => {
        if (!roomData || !isHost) return;

        // Case A: 배틀 페이즈 -> 카드 다 모이면 승부(doBattle) 실행
        if (roomData.status === 'battle') {
            const hostReady = roomData.host.currentCards?.length === 4;
            const guestReady = roomData.guest?.currentCards?.length === 4;

            if (hostReady && guestReady) {
                doBattle();
            }
        }

        if (roomData.status === 'result_check') {
            const timer = setTimeout(() => {
                const updates: any = {};
                const roomRef = ref(db, `rooms/${roomId}`);

                // 🔥 여기서 진짜 청소 및 다음 턴 진행
                updates[`status`] = 'battle'; // 다시 게임 시작
                updates[`turnCount`] = (roomData.turnCount || 0) + 1;
                updates[`host/currentCards`] = null;
                updates[`guest/currentCards`] = null;
                updates[`lastResult`] = null;

                update(roomRef, updates);
            }, 4000);

            return () => clearTimeout(timer); // 클린업 필수
        }
    }, [roomData]);

    return { startGame, placeNumber, submitCards };
};