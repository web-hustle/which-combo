import { useState } from "react";

interface Props {
    onJoin: (nickname: string) => void;
}

export const JoinRoomScreen = ({ onJoin }: Props) => {
    const [nickname, setNickname] = useState("");
    return (
        <div>
            <input onChange={(e) => setNickname(e.target.value)} value={nickname} />
            <button onClick={() => onJoin(nickname || "guest")}>참가</button>
        </div>
    );
};