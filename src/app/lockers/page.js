"use client";

import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/OnboardingFooter";
import styles from "./page.module.css";

export default function LockersPage() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (formData.username === "test" && formData.password === "test") {
            alert("로그인되었습니다. (임시: 사물함 신청 기능은 다음 단계에서 연결됩니다)");
        } else {
            alert("아이디 또는 비밀번호가 올바르지 않습니다. (임시: test/test)");
        }
    };

    return (
        <div className={styles.container}>
            <Header />
            <main className={styles.main}>
                <h1 className={styles.title}>사물함 신청</h1>
                <p className={styles.subtitle}>
                    사물함 신청은 정보대학 구성원만 가능합니다.
                    <br />
                    본인 인증 후 신청을 진행해 주세요.
                </p>
                <form className={styles.glassContainer} onSubmit={handleLogin}>
                    <div className={styles.inputField}>
                        <label htmlFor="username">아이디</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className={styles.inputField}>
                        <label htmlFor="password">비밀번호</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="*****"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.loginButton}>신청하러가기</button>
                </form>
            </main>
            <Footer />
        </div>
    );
} 