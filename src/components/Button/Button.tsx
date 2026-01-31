import React from "react";
import styles from "./Button.module.scss";

interface BoardProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

const Board: React.FC<BoardProps> = ({ label, onClick, disabled = false }) => {

    return (
        <button className={styles.buttonLayout} onClick={onClick}>{label}</button>
    );
};

export default Board;