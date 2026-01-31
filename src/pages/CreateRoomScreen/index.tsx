import { useState } from "react";
import Button from '../../components/Button/Button'
import Input from "../../components/Input/Input";

interface Props {
    onCreate: (nickname: string) => void;
}

export const CreateRoomScreen = ({ onCreate }: Props) => {
    const [nickname, setNickname] = useState("");
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Input onChange={(newVal) => setNickname(newVal)} value={nickname}></Input>
            <Button onClick={() => onCreate(nickname || "host")} label={'생성'}></Button>
        </div>
    );
};