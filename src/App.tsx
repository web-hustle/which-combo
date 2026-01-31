

import { useRoom } from "./hooks/useRoom";
import { useGameLogic } from "./hooks/useGameLogic";
import { CreateRoomScreen } from "./pages/CreateRoomScreen";
import { JoinRoomScreen } from "./pages/JoinRoomScreen";
import { PlacingScreen } from "./pages/PlacingScreen";
import { WaitingScreen } from "./pages/WaitingScreen";
import { forceBattleState } from "./utils/testSeeder";
import { BattleScreen } from "./pages/BattleScreen";

import './App.css';

function App() {
  const { myId, roomId, roomData, loading, createRoom, joinRoom } = useRoom();
  const { placeNumber, startGame, submitCards } = useGameLogic(
    roomId,
    myId,
    roomData
  );

  if (loading) return <div>Loading</div>;

  if (!roomData) {
    return (
      <div>
        <CreateRoomScreen onCreate={createRoom}></CreateRoomScreen>;
        <button onClick={() => forceBattleState(roomId, myId)}>
          forceBattleState
        </button>
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
      return (
        <BattleScreen
          roomData={roomData}
          myId={myId}
          submitCards={(ids) => submitCards(isHost ? "host" : "guest", ids)}
        ></BattleScreen>
      );
    case "finished":
  }
}

export default App;