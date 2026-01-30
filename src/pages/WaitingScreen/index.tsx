import type { RoomData } from "../../types";

interface Props {
    roomData: RoomData;
    roomId: string;
    onStart: () => void;
}

export const WaitingScreen = ({ roomData, roomId, onStart }: Props) => {
    const guestJoined = !!roomData.guest;

    return (
        <div>
            <h2>Room: {roomId}</h2>
            <h3>{roomData.host.nickname}</h3>
            {guestJoined ? (
                <div>
                    <h3>{roomData.guest?.nickname}</h3>
                    <button onClick={() => onStart()}>start</button>forceBattleState
                </div>
            ) : (
                <span>waiting</span>
            )}
        </div>
    );
};