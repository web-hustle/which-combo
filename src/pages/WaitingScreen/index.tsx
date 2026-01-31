import type { RoomData } from "../../types";
import Button from '../../components/Button/Button'

interface Props {
    roomData: RoomData;
    roomId: string;
    onStart: () => void;
    isHost: boolean;
}

export const WaitingScreen = ({ roomData, roomId, onStart, isHost }: Props) => {
    const guestJoined = !!roomData.guest;

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2>방 번호: {roomId}</h2>
            <div style={{ fontSize: '20px', color: '#666', marginBottom: '24px' }}>
                <span>{roomData.host.nickname}</span>{guestJoined ? <span> vs {roomData.guest?.nickname}</span> : null}
            </div>
            {guestJoined ? (
                <div>
                    {isHost ? <Button onClick={onStart} label={'시작'}></Button> : ''}
                </div>
            ) : (
                <div>게스트 입장 대기중...</div>
            )
            }

        </div >
    );
};