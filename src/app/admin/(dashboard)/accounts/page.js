"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { API_BASE, authorizedFetch } from "@/utils/auth";
import InputField from "@/components/InputField";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ orgName: "", username: "", password: "" });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

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
        setIsEditing(false);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setIsEditing(true);
        setEditingId(user.id);
        setForm({ orgName: user.first_name || "", username: user.username || "", password: "" });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!form.orgName || !form.username || !form.password) return;
        setError("");
        if (isEditing && editingId != null) {
            // 프론트에서만 목록 갱신 (수정 API 미정)
            setAccounts((prev) => prev.map((u) => (
                u.id === editingId ? { ...u, first_name: form.orgName, username: form.username } : u
            )));
            setIsModalOpen(false);
            return;
        }
        // 추가: 실제 등록 API 연동
        setSaving(true);
        try {
            const res = await authorizedFetch(`${API_BASE}/account/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                body: JSON.stringify({
                    username: form.username, // id
                    name: form.orgName,      // 단체명
                    password: form.password,
                    role: "STAFF",
                    groups: [],
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.detail || `요청 실패 (${res.status})`);
            }
            const data = await res.json().catch(() => ({}));
            const created = {
                id: data?.id ?? Date.now(),
                first_name: data?.first_name ?? form.orgName,
                username: data?.username ?? form.username,
            };
            setAccounts((prev) => [created, ...prev]);
            setIsModalOpen(false);
        } catch (e) {
            setError(e?.message || "계정 생성에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (userId) => {
        setAccounts((prev) => prev.filter((u) => u.id !== userId));
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
                    <div>액션</div>
                </div>
                {loading && (
                    <div className={styles.row}>
                        <div>로딩 중...</div>
                        <div></div>
                        <div></div>
                    </div>
                )}
                {!loading && error && (
                    <div className={styles.row}>
                        <div style={{ color: "#e74c3c" }}>{error}</div>
                        <div></div>
                        <div></div>
                    </div>
                )}
                {!loading && !error && accounts.map((user) => (
                    <div key={user.id} className={styles.row}>
                        <div>{user.first_name || ""}</div>
                        <div>{user.username || ""}</div>
                        <div className={styles.actions}>
                            <button className={styles.secondaryButton} onClick={() => openEditModal(user)}>수정</button>
                            <button className={styles.dangerButton} onClick={() => handleDelete(user.id)}>삭제</button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>{isEditing ? "계정 수정" : "계정 추가"}</h3>
                        <div className={styles.form}>
                            <InputField
                                id="orgName"
                                name="orgName"
                                label="단체명"
                                value={form.orgName}
                                onChange={handleChange}
                                placeholder="예: 정보대학 학생회"
                                containerClassName={styles.inputField}
                            />
                            <InputField
                                id="username"
                                name="username"
                                label="아이디"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="예: ieum_admin"
                                containerClassName={styles.inputField}
                            />
                            <InputField
                                id="password"
                                name="password"
                                type="password"
                                label="비밀번호"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={isEditing ? "새 비밀번호를 입력하세요" : "비밀번호를 입력하세요"}
                                containerClassName={styles.inputField}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.secondaryButton} onClick={closeModal}>취소</button>
                            <button className={styles.primaryButton} onClick={handleSave} disabled={!form.orgName || !form.username || !form.password || saving}>{isEditing ? (saving ? "수정 중..." : "수정") : (saving ? "추가 중..." : "추가")}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 