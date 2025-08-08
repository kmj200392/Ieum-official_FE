"use client";

import { useState } from "react";
import styles from "./page.module.css";

const initialAccounts = [
    { id: 1, orgName: "정보대학 학생회", username: "ieum_admin", password: "admin1234" },
    { id: 2, orgName: "정보대학 운영팀", username: "ops_staff", password: "staff123" },
    { id: 3, orgName: "정보대학 조교진", username: "ta_view", password: "view123" },
];

export default function AccountsPage() {
    const [accounts, setAccounts] = useState(initialAccounts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [form, setForm] = useState({ orgName: "", username: "", password: "" });

    const openAddModal = () => {
        setIsEditing(false);
        setEditingAccount(null);
        setForm({ orgName: "", username: "", password: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (account) => {
        setIsEditing(true);
        setEditingAccount(account);
        // 기존 값을 입력란에 바로 채움
        setForm({ orgName: account.orgName, username: account.username, password: account.password });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePrimary = () => {
        if (isEditing && editingAccount) {
            const updated = {
                ...editingAccount,
                orgName: form.orgName,
                username: form.username,
                password: form.password,
            };
            setAccounts((prev) => prev.map((a) => (a.id === editingAccount.id ? updated : a)));
            setIsModalOpen(false);
            return;
        }

        // Add mode
        if (!form.orgName || !form.username || !form.password) return;
        const next = { id: Date.now(), ...form };
        setAccounts((prev) => [next, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>계정 관리</h2>
                <button className={styles.primaryButton} onClick={openAddModal}>+ 계정 추가</button>
            </div>

            <div className={styles.table}>
                <div className={`${styles.row} ${styles.header}`}>
                    <div>단체명</div>
                    <div>아이디</div>
                    <div>비밀번호</div>
                    <div>액션</div>
                </div>
                {accounts.map((acc) => (
                    <div key={acc.id} className={styles.row}>
                        <div>{acc.orgName}</div>
                        <div>{acc.username}</div>
                        <div>{acc.password}</div>
                        <div className={styles.actions}>
                            <button className={styles.secondaryButton} onClick={() => openEditModal(acc)}>수정</button>
                            <button className={styles.dangerButton}>삭제</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>{isEditing ? "계정 수정" : "계정 추가"}</h3>
                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="orgName">단체명</label>
                                <input
                                    id="orgName"
                                    name="orgName"
                                    value={form.orgName}
                                    onChange={handleChange}
                                    placeholder="예: 정보대학 학생회"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="username">아이디</label>
                                <input
                                    id="username"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="예: ieum_admin"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="password">비밀번호</label>
                                <input
                                    id="password"
                                    type="text"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="비밀번호를 입력하세요"
                                />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.secondaryButton} onClick={closeModal}>취소</button>
                            <button
                                className={styles.primaryButton}
                                onClick={handlePrimary}
                                disabled={!isEditing && (!form.orgName || !form.username || !form.password)}
                            >
                                {isEditing ? "수정" : "추가"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 