"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

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
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("invalid");
            router.replace("/admin/accounts");
        } catch {
            setError("아이디 또는 비밀번호가 올바르지 않습니다. (임시: admin/admin)");
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