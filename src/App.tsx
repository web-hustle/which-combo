

import { useState } from "react";
import { useRoom } from "./hooks/useRoom";
import { useGameLogic } from "./hooks/useGameLogic";
import Board from "./components/Board";

function App() {
  const { myId, roomId, roomData, loading, createRoom, joinRoom } = useRoom();
  const { placeNumber, startGame } = useGameLogic(roomId, myId, roomData);
  const [nickname, setNickname] = useState("");

  if (loading) return <div>Loading</div>;

  if (!roomData) {
    return (
      <div>
        <input onChange={(e) => setNickname(e.target.value)} value={nickname} />
        <button onClick={() => createRoom(nickname || "host")}>생성</button>
      </div>
    );
  }

  const isHost = roomData.host.uid === myId;
  const isGuest = roomData.guest?.uid === myId;

  if (!isHost && !isGuest) {
    return (
      <div>
        <input onChange={(e) => setNickname(e.target.value)} value={nickname} />
        <button onClick={() => joinRoom(nickname || "host")}>참가</button>
      </div>
    );
  }

  if (roomData && roomData.status === "placing") {
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

    return (
      <div>
        {roomData.numberSequence[myIndex]}
        <Board board={myData.board} onCellClick={(idx) => placeNumber(idx)} />
      </div>
    );
  }

  const guestJoined = !!roomData.guest;

  return (
    <div>
      <h2>Room: {roomId}</h2>
      <h3>{roomData.host.nickname}</h3>
      {guestJoined ? (
        <div>
          <h3>{roomData.guest?.nickname}</h3>
          <button onClick={() => startGame()}>start</button>
        </div>
      ) : (
        <span>waiting</span>
      )}
    </div>
  );
}

export default App;