import Button from "../../components/Button/Button";
import type { RoomData } from "../../types";

interface Props {
  roomData: RoomData;
  myId: string;
  restartGame: () => void;
}

export const FinishScreen = ({ roomData, myId, restartGame }: Props) => {
  if (!roomData.guest) {
    return;
  }
  const isHost = roomData.host.uid === myId;

  const hostData = roomData.host;
  const guestData = roomData.guest;

  const winnerName =
    hostData.score > guestData.score ? hostData.nickname : guestData.nickname;

  return (
    <div>
      <h1>{winnerName} 승리!</h1>
      <h2>{hostData.score + " : " + guestData.score}</h2>
      <div>{isHost && <Button label="다시하기" onClick={restartGame} />}</div>
    </div>
  );
};