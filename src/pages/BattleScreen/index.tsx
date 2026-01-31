import { useState } from "react";
import Board from "../../components/Board";
import type { CellType, RoomData } from "../../types";

interface Props {
    roomData: RoomData;
    myId: string;
    submitCards: (cards: number[]) => void;
}

export const BattleScreen = ({ roomData, myId, submitCards }: Props) => {
    const isHost = roomData.host.uid === myId;
    const myData = isHost ? roomData.host : roomData.guest;

    if (!myData) {
        return;
    }

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const boardCells: CellType[] = myData?.board.map((num, idx) => ({
        value: num,
        status: selectedIds.includes(idx) ? "selected" : "default",
    }));

    const onSelect = (idx: number) => {
        if (selectedIds.length < 4) {
            boardCells[idx].status = "selected";
            const newIds = [...selectedIds, idx];

            if (newIds.length === 4) {
                submitCards(newIds); // update cards, turn
                setSelectedIds([]);
            } else {
                setSelectedIds(newIds);
            }
        }
    };

    const { host, guest } = roomData;

    if (!host || !guest) {
        return;
    }

    if (!host.currentCards || !guest.currentCards) {
        return (
            <div>
                {myData.currentCards ? "상대가 덱을 선택중입니다..." : "제출할 카드를 선택해주세요."}
                <h2>{`${host.score} : ${guest.score}`}</h2>
                <Board board={boardCells} onCellClick={(idx) => onSelect(idx)} />
            </div>
        );
    } else {
        return (<div>
            <h2>{`${host.score} : ${guest.score}`}</h2>
        </div>)
    }
};