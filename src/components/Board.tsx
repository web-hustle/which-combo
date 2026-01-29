import React from "react";

interface BoardProps {
    board: number[]; // [0, 7, 0, 3, ...] 형태의 25개 배열
    onCellClick: (index: number) => void; // 클릭했을 때 실행할 함수
    disabled?: boolean; // 클릭 막을지 여부 (상대 턴이거나 이미 배치 끝났을 때)
}

const Board: React.FC<BoardProps> = ({
    board,
    onCellClick,
    disabled = false,
}) => {
    return (
        <div style={gridStyle}>
            {board.map((value, index) => (
                <div
                    key={index}
                    onClick={() => !disabled && value === 0 && onCellClick(index)}
                    style={{
                        ...cellStyle,
                        backgroundColor: value !== 0 ? "#ccc" : "white",
                        cursor: disabled || value !== 0 ? "default" : "pointer",
                        opacity: disabled ? 0.6 : 1,
                    }}
                ></div>
            ))}
        </div>
    );
};

// --- 스타일 정의 (CSS 파일 없이 바로 쓰시라고 인라인으로 적었습니다) ---

const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)", // 핵심: 5등분해서 자동 줄바꿈
    gap: "8px", // 칸 사이 간격
    width: "100%",
    maxWidth: "350px", // 모바일에서 너무 커지지 않게
    aspectRatio: "1/1", // 정사각형 비율 유지
    margin: "0 auto", // 가운데 정렬
    backgroundColor: "#333", // 격자 선 색깔 느낌
    padding: "8px",
    borderRadius: "8px",
};

const cellStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
    borderRadius: "4px",
    transition: "background-color 0.2s",
    height: "100%", // 부모 그리드 높이에 맞춤
};

export default Board;