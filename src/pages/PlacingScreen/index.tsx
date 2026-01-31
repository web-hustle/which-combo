import Board from "../../components/Board";
import type { CellType, RoomData } from "../../types";

interface Props {
    roomData: RoomData;
    myId: string;
    onPlace: (index: number) => void;
}

export const PlacingScreen = ({ roomData, myId, onPlace }: Props) => {
    const isHost = roomData.host.uid === myId;
    const myData = isHost ? roomData.host : roomData.guest;

    if (!myData) return <div>Error</div>;

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
        if (statusBoard[idx].status === 'default') {
            onPlace(idx)
        }
    }

    return (
        <div>
            <h3>이번에 배치할 카드</h3>
            <h1>{roomData.numberSequence[myIndex]}</h1>
            <Board board={statusBoard} onCellClick={(idx) => placeIfPossible(idx)} />
        </div>
    );
};