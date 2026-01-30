
import { useEffect, useState } from "react";
import { db } from "../firebase"; // 아까 만든 firebase.ts
import { ref, onValue, set, update, get } from "firebase/database";
import type { RoomData, Player } from "../types/index";

const INITIAL_BOARD = Array(25).fill(0);

export const useRoom = () => {
    const [myId, setMyId] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. 초기화 (내 ID 생성 + URL에서 방 ID 파싱)
    useEffect(() => {
        // ID 가져오기/생성
        let id = localStorage.getItem("user_uid");
        if (!id) {
            id = "user_" + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("user_uid", id);
        }
        setMyId(id);

        // URL 파싱
        const params = new URLSearchParams(window.location.search);
        let urlRoomId = params.get("room");

        if (!urlRoomId) {
            // 방 ID가 없으면 랜덤 생성 (아직 DB엔 안 만듦)
            urlRoomId = Math.random().toString(36).substr(2, 6);
            window.history.replaceState({}, "", `?room=${urlRoomId}`);
        }
        setRoomId(urlRoomId);
    }, []);

    // 2. 방 구독 (실시간 동기화)
    useEffect(() => {
        if (!roomId) return;

        const roomRef = ref(db, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            setRoomData(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [roomId]);

    // 방 생성하기 (Host)
    const createRoom = async (nickname: string) => {
        if (!roomId || !myId) return;

        const initialData: RoomData = {
            roomId,
            status: "waiting",
            host: {
                uid: myId,
                nickname,
                isReady: true,
                board: INITIAL_BOARD,
                score: 0,
                completedLines: [],
                currentSequenceIndex: 0,
            },
            guest: null,
            numberSequence: [],
            turnCount: 0,
        };

        await set(ref(db, `rooms/${roomId}`), initialData);
    };

    // 방 참가하기 (Guest)
    const joinRoom = async (nickname: string) => {
        if (!roomId || !myId) return;

        const guestData: Player = {
            uid: myId,
            nickname,
            isReady: true,
            board: INITIAL_BOARD,
            score: 0,
            completedLines: [],
            currentSequenceIndex: 0,
        };

        await update(ref(db, `rooms/${roomId}`), {
            guest: guestData,
        });
    };

    return {
        myId,
        roomId,
        roomData,
        loading,
        createRoom,
        joinRoom,
    };
};