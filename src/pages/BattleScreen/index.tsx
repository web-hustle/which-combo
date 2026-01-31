import { useEffect, useState } from "react";
import Board from "../../components/Board";
import type { CellType, RoomData } from "../../types";
import { isValidSubset } from "../../utils/isValidSubmit";

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
        if (selectedIds.includes(idx)) {
            setSelectedIds(prev => prev.filter(i => i !== idx));
            return;
        }

        if (!isValidSubset(selectedIds, idx)) {
            alert("불가능한 패턴입니다!");
            setSelectedIds([]);
            return;
        }

        if (selectedIds.length < 4) {
            const newIds = [...selectedIds, idx];

            setSelectedIds(newIds);
            if (newIds.length === 4) {
                submitCards(newIds);
            }
        }
    }

    useEffect(() => {
        if (!myData.currentCards) {
            setSelectedIds([]);
        }
    }, [myData.currentCards]);

    const { host, guest } = roomData;

    if (!host || !guest) {
        return;
    }

    if (!host.currentCards || !guest.currentCards) {
        return (
            <div>
                {myData.currentCards ? "상대가 덱을 선택중입니다..." : "제출할 카드를 선택해주세요."}
                <h2>{`${host.score} : ${guest.score}`}</h2>
                <Board board={boardCells} onCellClick={(idx) => onSelect(idx)} disabled={selectedIds.length === 4} />
            </div>
        );
    } else {
        return (<div>
            <h2>{`${host.score} : ${guest.score}`}</h2>
            {roomData.status === 'result_check' && (
                <>
                    <div><h3>이전 라운드 결과</h3></div>
                    <div>호스트 카드: {roomData.lastResult?.hostCards.join(", ")}</div>
                    <div>게스트 카드: {roomData.lastResult?.guestCards.join(", ")}</div>
                    <div>승자: {roomData.lastResult?.winner}</div>
                </>
            )}
        </div>)
    }
};