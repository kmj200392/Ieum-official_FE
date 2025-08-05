"use client";
import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "./page.module.css";

export default function BookingPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    // 예약 상태 타입 정의
    const RESERVATION_STATES = {
        AVAILABLE: 'available',      // 이용 가능 (회색)
        PENDING: 'pending',          // 예약 중 (연빨강)
        CONFIRMED: 'confirmed'       // 예약 완료 (진한 빨강)
    };

    // 임시 예약 데이터 (실제로는 API에서 가져올 데이터)
    const [reservations, setReservations] = useState({
        // 예시: {dayIndex: {hourIndex: state}}
        0: { 3: RESERVATION_STATES.PENDING, 4: RESERVATION_STATES.PENDING, 5: RESERVATION_STATES.PENDING, 6: RESERVATION_STATES.PENDING, 7: RESERVATION_STATES.PENDING }, // SUN 3AM-7AM 예약 중
        1: { 10: RESERVATION_STATES.CONFIRMED, 11: RESERVATION_STATES.CONFIRMED, 12: RESERVATION_STATES.CONFIRMED }, // MON 10AM-12PM 예약 완료
        2: { 15: RESERVATION_STATES.PENDING, 16: RESERVATION_STATES.PENDING }, // TUE 3PM-4PM 예약 중
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        // 임시 로그인 로직: 아이디와 비밀번호가 모두 "test"인 경우 로그인 성공
        if (formData.username === "test" && formData.password === "test") {
            setIsLoggedIn(true);
        } else {
            alert("아이디 또는 비밀번호가 올바르지 않습니다. (임시: test/test)");
        }
    };

    // 예약 상태 확인 함수
    const getReservationState = (dayIndex, hourIndex) => {
        return reservations[dayIndex]?.[hourIndex] || RESERVATION_STATES.AVAILABLE;
    };

    // 슬롯 클릭 가능 여부 확인
    const isSlotClickable = (dayIndex, hourIndex) => {
        const state = getReservationState(dayIndex, hourIndex);
        return state === RESERVATION_STATES.AVAILABLE;
    };

    const handleSlotClick = (dayIndex, hourIndex) => {
        const state = getReservationState(dayIndex, hourIndex);

        if (state === RESERVATION_STATES.AVAILABLE) {
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            const time = hourIndex === 0 ? "12AM" : hourIndex === 12 ? "12PM" : hourIndex > 12 ? `${hourIndex - 12}PM` : `${hourIndex}AM`;
            alert(`${days[dayIndex]}요일 ${time} 시간대를 예약하시겠습니까?`);
        } else if (state === RESERVATION_STATES.PENDING) {
            alert("이미 예약 중인 시간대입니다.");
        } else if (state === RESERVATION_STATES.CONFIRMED) {
            alert("이미 예약 완료된 시간대입니다.");
        }
    };

    if (!isLoggedIn) {
        return (
            <div className={styles.container}>
                <Header />

                <main className={styles.main}>
                    <div className={styles.loginContainer}>
                        <h1 className={styles.title}>학생회실 대관</h1>
                        <p className={styles.subtitle}>로그인이 필요한 페이지입니다.</p>

                        <form className={styles.loginForm} onSubmit={handleLogin}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="username">아이디</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="password">비밀번호</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.loginButton}>
                                로그인
                            </button>
                        </form>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Header />

            <main className={styles.main}>
                <div className={styles.bookingPageContainer}>
                    <div className={styles.headerSection}>
                        <h1 className={styles.title}>학생회실 대관</h1>
                        <div className={styles.myReservation}>
                            <span>MY 예약 현황</span>
                        </div>
                    </div>

                    <div className={styles.bookingContainer}>
                        <div className={styles.timeColumn}>
                            {/* 시간 표시 */}
                            {Array.from({ length: 24 }, (_, i) => (
                                <div key={i} className={styles.timeLabel}>
                                    {i === 0 ? "12AM" : i === 12 ? "12PM" : i > 12 ? `${i - 12}PM` : `${i}AM`}
                                </div>
                            ))}
                        </div>

                        <div className={styles.weekGrid}>
                            {/* 요일 헤더 */}
                            <div className={styles.weekDays}>
                                <div className={styles.weekDay}>SUN</div>
                                <div className={styles.weekDay}>MON</div>
                                <div className={styles.weekDay}>TUE</div>
                                <div className={styles.weekDay}>WED</div>
                                <div className={styles.weekDay}>THU</div>
                                <div className={styles.weekDay}>FRI</div>
                                <div className={styles.weekDay}>SAT</div>
                            </div>

                            {/* 7일 x 24시간 그리드 */}
                            <div className={styles.timeSlotsGrid}>
                                {Array.from({ length: 7 }, (_, dayIndex) => (
                                    <div key={dayIndex} className={styles.dayColumn}>
                                        {Array.from({ length: 24 }, (_, hourIndex) => {
                                            const state = getReservationState(dayIndex, hourIndex);
                                            const isClickable = isSlotClickable(dayIndex, hourIndex);

                                            return (
                                                <div
                                                    key={hourIndex}
                                                    className={`${styles.timeSlot} ${styles[state]} ${!isClickable ? styles.disabled : ''}`}
                                                    onClick={() => handleSlotClick(dayIndex, hourIndex)}
                                                >
                                                    {state === RESERVATION_STATES.CONFIRMED && <span className={styles.purpose}>[대관 목적]</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <p className={styles.infoText}>
                            참고: 24시간 중 최대 5시간 (연속) 예약 가능, 그 이상 대관 원할 시 학생회에 문의<br />
                            업무 시간: 10:00 ~ 18:00
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
} 