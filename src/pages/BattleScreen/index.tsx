import { useEffect, useState } from "react";
import Board from "../../components/Board";
import type { CellType, RoomData } from "../../types";
import { isValidSubset } from "../../utils/isValidSubmit";
import HandResult from "../../components/HandResult";
import { findPatternByIndices } from '../../types';

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

    const completedLineIds = myData.completedLines || [];

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
                const pattern = findPatternByIndices(newIds);

                if (pattern && completedLineIds.includes(pattern.id)) {
                    alert("이미 사용한 패턴입니다");
                    setSelectedIds([]);
                    return;
                }
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

    return (
        <div>
            <div>
                {myData.currentCards ? "상대가 덱을 선택중입니다..." : "제출할 카드를 선택해주세요."}
                <h2>{`${host.score} : ${guest.score}`}</h2>
                <Board board={boardCells} onCellClick={(idx) => onSelect(idx)} disabled={selectedIds.length === 4} />
            </div>
            {host.currentCards === null || guest.currentCards === null ? null : <HandResult roomData={roomData} myId={myId} />}
        </div>
    );
};