

import { ref, update, get, set, onDisconnect, runTransaction } from "firebase/database";
import { db } from "../firebase";
import {
    findPatternByIndices,
    type CellInfo,
    type HandResult,
    type RoomData,
} from "../types/index";
import { useEffect } from "react";

export const useGameLogic = (
    roomId: string,
    myId: string,
    roomData: RoomData | null
) => {
    // 1. 게임 시작 (Host)

    const generateRandomSequence = () => {
        return Array.from({ length: 25 }, () => Math.floor(Math.random() * 10) + 1);
    };

    const startGame = async () => {
        if (!roomId || !roomData) return;

        // 25개 난수 생성
        const sequence = generateRandomSequence();

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
    if (!roomId || !roomData?.numberSequence) return;
    
    await runTransaction(ref(db, `rooms/${roomId}`), (room) => {
        if (!room) return;

        const myRole = isHost ? "host" : "guest";
        const opponentRole = isHost ? "guest" : "host";

        // 트랜잭션 내부의 최신 데이터(room)를 사용해야 합니다! (중요)
        const myData = room[myRole];
        const opponentData = room[opponentRole];

        if (myData.currentSequenceIndex >= 25) return;
        if (myData.isReady) return; // 이미 눌렀으면 중복 실행 방지

        const targetNumber = roomData.numberSequence[myData.currentSequenceIndex];
        const lastPlacedCard = {
            card: targetNumber,
            boardIndex: boardIndex,
        };

        myData.isReady = true;
        myData.lastPlacedCard = lastPlacedCard;
        myData.board[boardIndex] = lastPlacedCard.card;

        if (opponentData.isReady) {
            const nextIndex = myData.currentSequenceIndex + 1;

            if (nextIndex < 25) {
                // 다음 숫자로 진행
                myData.isReady = false;
                myData.currentSequenceIndex = nextIndex;
                
                opponentData.isReady = false;
                opponentData.currentSequenceIndex = nextIndex;
            } else {
                // 게임 종료 -> 배틀 페이즈로
                myData.isReady = false;
                opponentData.isReady = false;
                room.status = 'battle';
            }
        }
        return room;
        });
    };

    const submitCards = async (myRole: string, ids: number[]) => {
        await set(ref(db, `rooms/${roomId}/${myRole}/currentCards`), ids);
    };

    const doBattle = async () => {
        if (!roomData || !roomData.guest || !isHost) return;
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

        // 1. 포카드 (4장 동일)
        if (maxCount === 4) {
            return {
                score: 70000 + mainNum,
                rank: '포카드',
                highlight: [mainNum]
            };
        }

        // 2. 로티플 (연속된 4장)
        if (isRotifle) {
            return {
                score: 60000 + Math.max(...cards),
                rank: '로티플',
                highlight: cards // 전체 강조
            };
        }

        // 3. 스트레이트 (순서가 꼬인 연속된 4장)
        const isStraight = (sorted[0] - sorted[1] === 1) && (sorted[1] - sorted[2] === 1) && (sorted[2] - sorted[3] === 1);
        if (isStraight) {
            return {
                score: 50000 + sorted[0],
                rank: '스트레이트',
                highlight: cards // 전체 강조
            };
        }

        // 4. 투페어 (두 쌍 강조)
        if (maxCount === 2 && pattern[1].count === 2) {
            const bigPair = pattern[0].num;
            const smallPair = pattern[1].num;
            return {
                score: 40000 + (bigPair * 100) + smallPair,
                rank: '투페어',
                highlight: [bigPair, smallPair]
            };
        }

        // 5. 트리플 (3장 동일)
        if (maxCount === 3) {
            return {
                score: 30000 + mainNum,
                rank: '트리플',
                highlight: [mainNum]
            };
        }

        // 6. 원페어 (페어 숫자만 강조)
        if (maxCount === 2) {
            return {
                score: 20000 + mainNum,
                rank: '원페어',
                highlight: [mainNum]
            };
        }

        // 7. 하이카드 (가장 높은 숫자 하나만 강조)
        return {
            score: 10000 + sorted[0],
            rank: '하이카드',
            highlight: [sorted[0]]
        };
    };

    const restartGame = () => {
        if (!isHost) return;

        const updates: any = {};

        // 1. Room 공통 데이터 리셋
        const newSequence = generateRandomSequence(); // 🔥 공통 시퀀스 생성

        updates['status'] = 'placing';       // 배치 단계로 회귀
        updates['turnCount'] = 1;            // 턴 초기화
        updates['numberSequence'] = newSequence; // 25개 숫자 공유
        updates['lastResult'] = null;        // 이전 결과 삭제
        updates['winner'] = null;            // 승자 정보 삭제

        // 2. 플레이어 초기화 (Host & Guest 공통)
        // board는 0으로 채워서 '빈 칸'임을 명시
        const emptyBoard = Array(25).fill(0);

        // --- HOST ---
        updates['host/board'] = emptyBoard;
        updates['host/score'] = 0;
        updates['host/completedLines'] = [];
        updates['host/currentSequenceIndex'] = 0;
        updates['host/currentCards'] = null;

        // --- GUEST ---
        updates['guest/board'] = emptyBoard;
        updates['guest/score'] = 0;
        updates['guest/completedLines'] = [];
        updates['guest/currentSequenceIndex'] = 0;
        updates['guest/currentCards'] = null;

        // DB 업데이트
        update(ref(db, `rooms/${roomId}`), updates);
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

        // Case B: 결과 확인 후 -> 일정 시간 뒤 다음 라운드 or 게임 종료
        if (roomData.status === 'result_check') {
            const timer = setTimeout(() => {
                const roomRef = ref(db, `rooms/${roomId}`);
                const updates: any = {};

                const currentTurn = roomData.turnCount || 1;
                const nextTurn = currentTurn + 1;

                if (nextTurn > 12) {
                    updates[`status`] = 'finished';
                } else {
                    updates[`status`] = 'battle';
                    updates[`turnCount`] = nextTurn;
                    updates[`host/currentCards`] = null;
                    updates[`guest/currentCards`] = null;
                    updates[`lastResult`] = null;
                }

                update(roomRef, updates);
            }, 3000); // 3초 대기

            return () => clearTimeout(timer); // 클린업 필수
        }
    }, [roomData]);

    useEffect(() => {
        if (isHost && roomId) {
            const roomRef = ref(db, `rooms/${roomId}`);

            onDisconnect(roomRef).remove();
            // TODO: 게스트에게 호스트가 나갔음을 알림
            // onDisconnect(roomRef).update({ status: 'host_disconnected' });
        }
    }, [isHost, roomId]);

    return { startGame, placeNumber, submitCards, restartGame };
};
