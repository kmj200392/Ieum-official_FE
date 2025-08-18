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
            const res = await fetch("https://dev-api.kucisc.kr/api/account/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json", accept: "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                let message = "로그인에 실패했습니다.";
                try { const data = await res.json(); if (typeof data?.detail === "string") message = data.detail; } catch { }
                throw new Error(message);
            }
            const data = await res.json().catch(() => ({}));
            const access = data?.access;
            const refresh = data?.refresh;
            if (typeof access !== "string") throw new Error("로그인 응답이 올바르지 않습니다.");

            // 1) 클라이언트 토큰 저장 (accounts 페이지의 client-side fetch에 사용)
            setTokens(access, refresh);
            scheduleAccessTokenRefresh(access, refresh);

            // 2) 서버 세션/역할 쿠키 설정 (middleware 보호용)
            const sessRes = await fetch("/api/admin/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ access, refresh }),
            });
            if (!sessRes.ok) throw new Error("관리자 권한이 없습니다.");

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