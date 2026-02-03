import React from "react";
import styles from "./Board.module.scss";
import type { CellType } from "../types";
import { getCellName } from "../utils/getFunction";

interface BoardProps {
    board: CellType[]; // [0, 7, 0, 3, ...] 형태의 25개 배열
    onCellClick: (index: number) => void; // 클릭했을 때 실행할 함수
    disabled?: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, disabled = false }) => {
    const getStyleByStatus = (status: string) => {
        if (status === "disabled") {
            return styles.disabled;
        } else if (status === "selected") {
            return styles.selected;
        } else {
            return styles.default;
        }
    };

    return (
        <div className={styles.gridStyle}>
            {board.map((cell, index) => (
                <div
                    key={index}
                    onClick={() => !disabled && onCellClick(index)}
                    className={`${styles.cellStyle} ${getStyleByStatus(cell.status)}`}
                >{getCellName(index)}</div>
            ))}
        </div>
    );
};

export default Board;