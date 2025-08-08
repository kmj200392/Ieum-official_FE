"use client";

import styles from "./page.module.css";

const mockAccounts = [
    { id: 1, name: "홍길동", email: "hong@korea.ac.kr", role: "관리자", status: "활성" },
    { id: 2, name: "김학생", email: "kim@korea.ac.kr", role: "스태프", status: "활성" },
    { id: 3, name: "이조교", email: "lee@korea.ac.kr", role: "조회권한", status: "비활성" },
];

export default function AccountsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>계정 관리</h2>
                <button className={styles.primaryButton}>+ 계정 추가</button>
            </div>

            <div className={styles.table}>
                <div className={`${styles.row} ${styles.header}`}>
                    <div>이름</div>
                    <div>이메일</div>
                    <div>권한</div>
                    <div>상태</div>
                    <div>액션</div>
                </div>
                {mockAccounts.map((acc) => (
                    <div key={acc.id} className={styles.row}>
                        <div>{acc.name}</div>
                        <div>{acc.email}</div>
                        <div>{acc.role}</div>
                        <div>{acc.status}</div>
                        <div className={styles.actions}>
                            <button className={styles.secondaryButton}>수정</button>
                            <button className={styles.dangerButton}>비활성화</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 