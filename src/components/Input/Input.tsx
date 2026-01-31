import React from "react";
import styles from "./Input.module.scss";

interface InputProps {
    value: string;
    onChange: (newVal: string) => void;
}

const Input: React.FC<InputProps> = ({ value, onChange }) => {

    return (
        <input className={styles.inputLayout} onChange={(e) => onChange(e.target.value)} value={value} maxLength={10} placeholder="nickname"></input>
    );
};

export default Input;