import { useEffect, useState } from "react";
import Board from "../../components/Board";
import type { CellInfo, CellType, RoomData } from "../../types";
import { getCellName } from "../../utils/getFunction";

interface Props {
    roomData: RoomData;
    myId: string;
    onPlace: (index: number) => void;
}

export const PlacingScreen = ({ roomData, myId, onPlace }: Props) => {
    const isHost = roomData.host.uid === myId;
    const myData = isHost ? roomData.host : roomData.guest;
    const opponentData = isHost ? roomData.guest : roomData.host;

    if (!myData || !opponentData) return <div>Error</div>;

    const myIndex = myData.currentSequenceIndex;
    const isFinish = myIndex >= 25;

    if (isFinish) {
        return (
            <div style={{ textAlign: "center", padding: "32px" }}>
                <h2>배치</h2>
            </div>
        );
    }

    const statusBoard: CellType[] = myData.board.map((num) => ({
        value: num,
        status: num === 0 ? "default" : "disabled",
    }));

    const placeIfPossible = (idx: number) => {
        if (statusBoard[idx].status === "default" && !myData.isReady) {
            onPlace(idx);
        }
    };

    const [lastOpponentCard, setLastOpponentCard] = useState<CellInfo>({ card: 0, boardIndex: -1 });

    useEffect(() => {
        // 서로 보드에 카드를 입력함
        if (!opponentData.isReady && !myData.isReady && opponentData.lastPlacedCard) {
            setLastOpponentCard(opponentData.lastPlacedCard);
        }
    }, [opponentData.isReady, myData.isReady]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3>이번에 배치할 카드</h3>
            <h1>{roomData.numberSequence[myIndex]}</h1>
            <Board board={statusBoard} onCellClick={(idx) => placeIfPossible(idx)} />
            <div style={{ marginTop: '24px', textAlign: 'center', border: '4px solid #333', width: '300px', height: '80px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: '#666', fontSize: '16px', fontWeight: 'bold' }}>상대({opponentData.nickname})의 마지막 배치</div>
                {lastOpponentCard && lastOpponentCard.boardIndex !== -1 ? (
                    <div style={{ color: '#d00', fontSize: '20px', fontWeight: 'bolder' }}>{getCellName(lastOpponentCard.boardIndex)} = {lastOpponentCard.card}</div>
                ) : (
                    " "
                )}
            </div>
            <div style={{ marginTop: "8px", fontSize: "16px", color: "#d00", height: '26px' }}>
                <div style={{ transition: 'opacity 0.3s ease-in-out', opacity: opponentData.isReady || myData.isReady ? 1 : 0 }}>
                    {opponentData.isReady ? "(상대방 배치 완료 대기 중)" : myData.isReady ? "(배치 완료 대기 중)" : ""}
                </div>
            </div>
        </div>
    );
};