"use client";

import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/OnboardingFooter";
import InputField from "../../components/InputField";
import styles from "./page.module.css";

export default function LockersPage() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loginError, setLoginError] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (loginError) setLoginError("");
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (formData.username === "test" && formData.password === "test") {
            // 성공 시 별도 알림 없음
        } else {
            setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.");
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
                        <InputField
                            id="username"
                            name="username"
                            label="아이디"
                            placeholder="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            error={loginError}
                        />
                    </div>
                    <div className={styles.inputField}>
                        <InputField
                            id="password"
                            name="password"
                            type="password"
                            label="비밀번호"
                            placeholder="*****"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            error={loginError}
                        />
                    </div>
                    <button type="submit" className={styles.loginButton}>신청하러 가기</button>
                </form>
            </main>
            <Footer />
        </div>
    );
} 