import { useState } from "react";
import Button from '../../components/Button/Button'
import Input from "../../components/Input/Input";

interface Props {
    onJoin: (nickname: string) => void;
}

export const JoinRoomScreen = ({ onJoin }: Props) => {
    const [nickname, setNickname] = useState("");
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Input onChange={(newVal) => setNickname(newVal)} value={nickname}></Input>
            <Button onClick={() => onJoin(nickname || "host")} label={'생성'}></Button>
        </div>
    );
};