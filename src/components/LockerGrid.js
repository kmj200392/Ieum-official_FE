"use client";

import React from "react";
import styles from "./LockerGrid.module.css";

const LockerState = {
    AVAILABLE: 'available',    // 선택 가능
    DISABLED: 'disabled',      // 선택 불가능
    ASSIGNED: 'assigned',      // 배정됨
    SELECTED: 'selected'       // 선택됨
};

export default function LockerGrid({
    lockers = [],
    onLockerSelect,
    selectedLocker = null,
    columns,
    disableSelection = false,
}) {
    const handleLockerClick = (lockerId, state) => {
        if (disableSelection) return;
        if (state === LockerState.AVAILABLE) {
            onLockerSelect?.(lockerId);
        }
    };

    const gridStyle = columns ? { ['--grid-template-columns']: `repeat(${columns}, 79px)` } : undefined;

    return (
        <div className={styles.gridContainer} style={gridStyle}>
            {lockers.map((locker) => (
                <div
                    key={locker.id}
                    className={`${styles.locker} ${styles[locker.state]} ${selectedLocker === locker.id ? styles.selected : ''
                        }`}
                    onClick={() => handleLockerClick(locker.id, locker.state)}
                    title={`사물함 ${locker.number} - ${getStateText(locker.state)}`}
                >
                    <span className={styles.lockerNumber}>{locker.number}</span>
                    {locker.state === LockerState.DISABLED && (
                        <div className={styles.disabledIcon}>
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                    d="M5 5 L95 95"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                />
                                <path
                                    d="M95 5 L5 95"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function getStateText(state) {
    switch (state) {
        case LockerState.AVAILABLE:
            return '선택 가능';
        case LockerState.DISABLED:
            return '선택 불가능';
        case LockerState.ASSIGNED:
            return '배정됨';
        case LockerState.SELECTED:
            return '선택됨';
        default:
            return '';
    }
}

export { LockerState }; 