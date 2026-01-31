import React from 'react';
import type { RoomData, HandAnalysis } from '../../types/index';

interface Props {
    roomData: RoomData;
    myId: string;
}

export default function HandResult({ roomData, myId }: Props) {
    const result = roomData.lastResult;
    if (!result) return null;

    const { winner, hostHand, guestHand } = result;
    const isHost = roomData.host.uid === myId;

    // 승패 판정
    const isWin = (isHost && winner === 'host') || (!isHost && winner === 'guest');
    const isDraw = winner === 'draw';

    return (
        <div style={styles.overlay}>
            <div style={styles.modalBox}>

                {/* 1. 승패 타이틀 (화려하게) */}
                <h1 style={{
                    ...styles.title,
                    color: isDraw ? '#888' : (isWin ? '#2196F3' : '#F44336')
                }}>
                    {isDraw ? "DRAW" : (isWin ? "VICTORY! 🎉" : "DEFEAT... 💀")}
                </h1>

                {/* 2. 대결 구도 (Host vs Guest) */}
                <div style={styles.versusContainer}>
                    <HandDisplay
                        label={roomData.host.nickname}
                        hand={hostHand}
                        isWinner={winner === 'host'}
                    />

                    <div style={styles.vsBadge}>VS</div>

                    <HandDisplay
                        label={roomData.guest?.nickname || "Guest"}
                        hand={guestHand}
                        isWinner={winner === 'guest'}
                    />
                </div>

                {/* 3. 안내 문구 */}
                <div style={styles.footerText}>
                    잠시 후 다음 라운드가 시작됩니다...
                </div>
            </div>
        </div>
    );
}

// 내부용: 패 보여주는 컴포넌트
function HandDisplay({ label, hand, isWinner }: { label: string, hand: HandAnalysis, isWinner: boolean }) {
    return (
        <div style={{
            ...styles.handContainer,
            opacity: isWinner ? 1 : 0.6,
            transform: isWinner ? 'scale(1.05)' : 'scale(1)'
        }}>
            <div style={styles.playerLabel}>
                {label} {isWinner && "👑"}
            </div>

            <div style={styles.rankLabel}>{hand.rank}</div>

            <div style={styles.cardsRow}>
                {hand.cards.map((num, i) => {
                    // 강조 카드인지 확인
                    const isHighlight = hand.highlight.includes(num);
                    return (
                        <div key={i} style={{
                            ...styles.card,
                            borderColor: isHighlight ? '#FFD700' : '#ddd', // 금색 테두리
                            backgroundColor: isHighlight ? '#FFF9C4' : '#fff', // 연한 노란 배경
                            fontWeight: isHighlight ? 'bold' : 'normal',
                            transform: isHighlight ? 'translateY(-5px)' : 'none' // 살짝 위로 뜸
                        }}>
                            {num}
                        </div>
                    );
                })}
            </div>
            <div style={styles.scoreLabel}>Score: {hand.score.toLocaleString()}</div>
        </div>
    );
}

// --- CSS-in-JS 스타일 (복사해서 쓰세요) ---
const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'absolute', // 부모 기준 절대 위치
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)', // 뒤 배경 어둡게
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // 제일 위에
        backdropFilter: 'blur(3px)', // 뒤 배경 블러 처리 (고급짐)
        borderRadius: '8px', // 게임판이 둥글다면 맞춰주기
    },
    modalBox: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        textAlign: 'center',
        minWidth: '320px',
        maxWidth: '90%',
        animation: 'popIn 0.3s ease-out', // 팝업 애니메이션 효과
    },
    title: {
        fontSize: '32px',
        margin: '0 0 20px 0',
        fontWeight: 900,
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    versusContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
    },
    vsBadge: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#333',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    handContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'all 0.3s ease',
    },
    playerLabel: {
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '4px',
        color: '#555',
    },
    rankLabel: {
        fontSize: '18px',
        color: '#673AB7', // 보라색 계열
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    cardsRow: {
        display: 'flex',
        gap: '4px',
    },
    card: {
        width: '32px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
    },
    scoreLabel: {
        fontSize: '10px',
        color: '#999',
        marginTop: '6px',
    },
    footerText: {
        marginTop: '25px',
        fontSize: '12px',
        color: '#aaa',
        animation: 'blink 1.5s infinite', // 깜빡임 효과
    }
};