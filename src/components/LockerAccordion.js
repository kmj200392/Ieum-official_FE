"use client";

import React, { useState } from "react";
import styles from "./LockerAccordion.module.css";

export default function LockerAccordion({
    title,
    children,
    isOpen,
    onToggle
}) {
    const isControlled = typeof isOpen === 'boolean';
    const [isOpenState, setIsOpenState] = useState(false);
    const open = isControlled ? isOpen : isOpenState;

    const handleToggle = () => {
        if (isControlled) {
            onToggle?.(!open);
        } else {
            const next = !open;
            setIsOpenState(next);
            onToggle?.(next);
        }
    };

    return (
        <div className={styles.accordionItem}>
            <button
                className={styles.accordionHeader}
                onClick={handleToggle}
                aria-expanded={open}
            >
                <span className={styles.title}>{title}</span>
                <span className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}>
                    <svg
                        width="20"
                        height="10"
                        viewBox="0 0 20 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2 2L10 8L18 2"
                            stroke="#2C2C2C"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </button>

            {open && (
                <div className={styles.accordionContent}>
                    {children}
                </div>
            )}

            <div className={styles.separator} />
        </div>
    );
} 