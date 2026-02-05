

import { useRoom } from "./hooks/useRoom";
import { useGameLogic } from "./hooks/useGameLogic";
import { CreateRoomScreen } from "./pages/CreateRoomScreen";
import { JoinRoomScreen } from "./pages/JoinRoomScreen";
import { PlacingScreen } from "./pages/PlacingScreen";
import { WaitingScreen } from "./pages/WaitingScreen";
import { BattleScreen } from "./pages/BattleScreen";

import './App.css';
import { FinishScreen } from "./pages/FinishScreen";

function App() {
  const { myId, roomId, roomData, loading, createRoom, joinRoom } = useRoom();
  const { placeNumber, startGame, submitCards, restartGame } = useGameLogic(
    roomId,
    myId,
    roomData
  );

  if (loading) return <div>Loading</div>;

  if (!roomData) {
    return (
      <div>
        <CreateRoomScreen onCreate={createRoom}></CreateRoomScreen>
      </div>
    );
  }

  const isHost = roomData.host.uid === myId;
  const isGuest = roomData.guest?.uid === myId;

  if (!isHost && !isGuest) {
    return <JoinRoomScreen onJoin={joinRoom}></JoinRoomScreen>;
  }

  switch (roomData.status) {
    case "waiting":
      return (
        <WaitingScreen
          onStart={startGame}
          roomData={roomData}
          roomId={roomId}
          isHost={isHost}
        ></WaitingScreen>
      );
    case "placing":
      return (
        <PlacingScreen
          roomData={roomData}
          myId={myId}
          onPlace={placeNumber}
        ></PlacingScreen>
      );
    case "battle":
    case "result_check":
      return (
        <BattleScreen
          roomData={roomData}
          myId={myId}
          submitCards={(ids) => submitCards(isHost ? "host" : "guest", ids)}
        ></BattleScreen>
      );
    case "finished":
      return <FinishScreen roomData={roomData} myId={myId} restartGame={restartGame}></FinishScreen>;
  }
}

export default App;