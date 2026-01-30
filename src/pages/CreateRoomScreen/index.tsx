import { useState } from "react";

interface Props {
    onCreate: (nickname: string) => void;
}

export const CreateRoomScreen = ({ onCreate }: Props) => {
    const [nickname, setNickname] = useState("");
    return (
        <div>
            <input onChange={(e) => setNickname(e.target.value)} value={nickname} />
            <button onClick={() => onCreate(nickname || "host")}>생성</button>
        </div>
    );
};