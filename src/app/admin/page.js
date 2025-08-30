"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { setTokens, scheduleAccessTokenRefresh } from "@/utils/auth";

export default function AdminLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // 새로운 login API 사용 (자동으로 쿠키 설정)
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const message = errorData?.error || "로그인에 실패했습니다.";
                throw new Error(message);
            }

            const data = await res.json();
            const { access, refresh } = data;

                        // 클라이언트 토큰 저장 (다른 페이지의 client-side fetch에 사용)
            setTokens(access, refresh);
            
            // booking 페이지 등에서 사용하는 adminToken도 저장
            localStorage.setItem('adminToken', access);
            
            // refresh 토큰이 있을 때만 자동 갱신 스케줄링
            if (refresh) {
                scheduleAccessTokenRefresh(access, refresh);
            }

            // 로그인 성공 - admin dashboard로 이동
            router.replace("/admin/accounts");
        } catch (e) {
            setError(e?.message || "로그인에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <h1 className={styles.title}>관리자 로그인</h1>
                <p className={styles.subtitle}>관리자 전용 페이지입니다.</p>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="username">아이디</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="아이디를 입력하세요"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">비밀번호</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                    <button type="submit" className={styles.loginButton} disabled={loading}>{loading ? "로그인 중..." : "로그인"}</button>
                </form>
            </div>
        </div>
    );
} 