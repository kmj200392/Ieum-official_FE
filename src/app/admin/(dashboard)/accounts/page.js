"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { API_BASE, authorizedFetch } from "@/utils/auth";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>계정 관리</h2>
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
        </div>
    );
} 