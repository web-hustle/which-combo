import { ALL_PATTERNS } from '../types/deck';

export const isValidSubset = (currentSelected: number[], nextIndex: number): boolean => {
    // 사용자가 클릭하려는 nextIndex까지 포함해서 임시 배열 생성
    const candidate = [...currentSelected, nextIndex];

    // 28개 패턴 중, candidate의 모든 숫자를 포함하고 있는 놈이 하나라도 있는지 확인
    const hasPossibleFuture = ALL_PATTERNS.some(pattern => {
        // pattern.indices가 candidate의 모든 요소를 포함하는가?
        return candidate.every(target => pattern.indices.includes(target));
    });

    return hasPossibleFuture;
};