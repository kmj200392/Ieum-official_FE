"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { API_BASE, authorizedFetch } from "@/utils/auth";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ orgName: "", username: "", password: "" });

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await authorizedFetch(`${API_BASE}/account/users/`, {
                    method: "GET",
                    headers: { accept: "application/json" },
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data?.detail || `요청 실패 (${res.status})`);
                }
                const data = await res.json();
                // API는 사용자 배열을 반환한다고 가정
                if (isMounted) setAccounts(Array.isArray(data) ? data : (data?.results || []));
            } catch (e) {
                if (isMounted) setError(e?.message || "데이터를 불러오지 못했습니다.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        load();
        return () => {
            isMounted = false;
        };
    }, []);

    const openAddModal = () => {
        setForm({ orgName: "", username: "", password: "" });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        if (!form.orgName || !form.username || !form.password) return;
        // 프론트에서만 우선 테이블에 반영 (실제 생성 API 연동 전)
        const newRow = { id: Date.now(), first_name: form.orgName, username: form.username };
        setAccounts((prev) => [newRow, ...prev]);
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
                </div>
                {loading && (
                    <div className={styles.row}>
                        <div>로딩 중...</div>
                        <div></div>
                    </div>
                )}
                {!loading && error && (
                    <div className={styles.row}>
                        <div style={{ color: "#e74c3c" }}>{error}</div>
                        <div></div>
                    </div>
                )}
                {!loading && !error && accounts.map((user) => (
                    <div key={user.id} className={styles.row}>
                        <div>{user.first_name || ""}</div>
                        <div>{user.username || ""}</div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>계정 추가</h3>
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
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="비밀번호를 입력하세요"
                                />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.secondaryButton} onClick={closeModal}>취소</button>
                            <button className={styles.primaryButton} onClick={handleAdd} disabled={!form.orgName || !form.username || !form.password}>추가</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 