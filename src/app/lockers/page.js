"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/OnboardingFooter";
import InputField from "../../components/InputField";
import LockerAccordion from "../../components/LockerAccordion";
import LockerGrid from "../../components/LockerGrid";
import LockerLegend from "../../components/LockerLegend";
import { LockerState } from "../../components/LockerGrid";
import styles from "./page.module.css";
import GlassContainer from "../../components/GlassContainer";

export default function LockersPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loginError, setLoginError] = useState("");
    const [selectedLocker, setSelectedLocker] = useState(null);

    // 샘플 사물함 데이터
    const lockerLocations = [
        {
            id: "info-b1-elevator",
            title: "정보관 지하 1층 - 엘리베이터",
            lockers: generateSampleLockers(1, 50)
        },
        {
            id: "info-b1-machine",
            title: "정보관 지하 1층 - 기계실",
            lockers: generateSampleLockers(51, 100)
        },
        {
            id: "info-2f",
            title: "정보관 2층",
            lockers: generateSampleLockers(101, 150)
        },
        {
            id: "info-3f",
            title: "정보관 3층",
            lockers: generateSampleLockers(151, 200)
        },
        {
            id: "science-6f-left",
            title: "과학도서관 6층 - 왼쪽 (620호 옆)",
            lockers: generateSampleLockers(201, 250)
        },
        {
            id: "science-6f-right",
            title: "과학도서관 6층 - 오른쪽 (614A호 옆)",
            lockers: generateSampleLockers(251, 300)
        }
    ];

    function generateSampleLockers(start, end) {
        const lockers = [];
        for (let i = start; i <= end; i++) {
            const random = Math.random();
            let state;
            if (random < 0.6) {
                state = LockerState.AVAILABLE;
            } else if (random < 0.8) {
                state = LockerState.DISABLED;
            } else {
                state = LockerState.ASSIGNED;
            }

            lockers.push({
                id: `locker-${i}`,
                number: i,
                state: state
            });
        }
        return lockers;
    }

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
            setIsLoggedIn(true);
        } else {
            setLoginError("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
    };

    const handleLockerSelect = (lockerId) => {
        setSelectedLocker(lockerId);
    };

    // 로그인 전 화면
    if (!isLoggedIn) {
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
                    <GlassContainer as="form" radius={50} padding={50} variant="container" onSubmit={handleLogin} className={styles.glassContainer}>
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
                            />
                        </div>
                        <button type="submit" className={styles.loginButton}>로그인</button>
                    </GlassContainer>
                </main>
                <Footer />
            </div>
        );
    }

    // 로그인 후 사물함 배정표 화면
    return (
        <div className={styles.container}>
            <Header variant="simple" />
            <main className={styles.main}>
                <div className={styles.lockerPageContainer}>
                    <div className={styles.headerSection}>
                        <h1 className={styles.title}>사물함 배정표</h1>
                    </div>

                    <div className={styles.contentSection}>
                        {/* 범례 */}
                        <LockerLegend />

                        {/* 아코디언 컨테이너 */}
                        <div className={styles.accordionContainer}>
                            {lockerLocations.map((location) => (
                                <LockerAccordion
                                    key={location.id}
                                    title={location.title}
                                >
                                    <LockerGrid
                                        lockers={location.lockers}
                                        selectedLocker={selectedLocker}
                                        onLockerSelect={handleLockerSelect}
                                    />
                                </LockerAccordion>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* 선택된 사물함이 있을 때 신청 버튼 */}
            {selectedLocker && (
                <button
                    className={styles.applyButton}
                    onClick={() => {
                        alert(`사물함 ${selectedLocker.replace('locker-', '')}번 신청이 완료되었습니다!`);
                        setSelectedLocker(null);
                    }}
                >
                    사물함 신청하기
                </button>
            )}

            <Footer />
        </div>
    );
} 