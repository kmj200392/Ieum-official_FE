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

    // 선택된 슬롯들 관리
    const [selectedSlots, setSelectedSlots] = useState(new Set());

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

    // 슬롯 키 생성 (dayIndex:hourIndex 형태)
    const getSlotKey = (dayIndex, hourIndex) => `${dayIndex}:${hourIndex}`;

    // 슬롯 키에서 dayIndex와 hourIndex 추출
    const parseSlotKey = (slotKey) => {
        const [dayIndex, hourIndex] = slotKey.split(':').map(Number);
        return { dayIndex, hourIndex };
    };

    // 연속된 슬롯인지 확인
    const isConsecutive = (slotKey1, slotKey2) => {
        const { dayIndex: day1, hourIndex: hour1 } = parseSlotKey(slotKey1);
        const { dayIndex: day2, hourIndex: hour2 } = parseSlotKey(slotKey2);

        // 같은 요일에서 연속된 시간
        if (day1 === day2 && Math.abs(hour1 - hour2) === 1) return true;

        // 요일 경계를 넘는 연속 (예: 화요일 23시 -> 수요일 0시)
        if (day1 === day2 - 1 && hour1 === 23 && hour2 === 0) return true;
        if (day1 === day2 + 1 && hour1 === 0 && hour2 === 23) return true;

        return false;
    };

    // 선택된 슬롯이 연속된 그룹인지 확인
    const getConsecutiveGroups = (slots) => {
        if (slots.size === 0) return [];

        const sortedSlots = Array.from(slots).sort((a, b) => {
            const { dayIndex: dayA, hourIndex: hourA } = parseSlotKey(a);
            const { dayIndex: dayB, hourIndex: hourB } = parseSlotKey(b);

            if (dayA !== dayB) return dayA - dayB;
            return hourA - hourB;
        });

        const groups = [];
        let currentGroup = [sortedSlots[0]];

        for (let i = 1; i < sortedSlots.length; i++) {
            if (isConsecutive(sortedSlots[i - 1], sortedSlots[i])) {
                currentGroup.push(sortedSlots[i]);
            } else {
                groups.push([...currentGroup]);
                currentGroup = [sortedSlots[i]];
            }
        }
        groups.push(currentGroup);

        return groups;
    };

    // 슬롯이 선택되었는지 확인
    const isSlotSelected = (dayIndex, hourIndex) => {
        return selectedSlots.has(getSlotKey(dayIndex, hourIndex));
    };

    const handleSlotClick = (dayIndex, hourIndex) => {
        const state = getReservationState(dayIndex, hourIndex);

        if (state !== RESERVATION_STATES.AVAILABLE) {
            if (state === RESERVATION_STATES.PENDING) {
                alert("이미 예약 중인 시간대입니다.");
            } else if (state === RESERVATION_STATES.CONFIRMED) {
                alert("이미 예약 완료된 시간대입니다.");
            }
            return;
        }

        const slotKey = getSlotKey(dayIndex, hourIndex);
        const newSelectedSlots = new Set(selectedSlots);

        if (selectedSlots.has(slotKey)) {
            // 이미 선택된 슬롯을 클릭한 경우
            const groups = getConsecutiveGroups(selectedSlots);
            const clickedGroup = groups.find(group => group.includes(slotKey));

            if (clickedGroup) {
                // 클릭한 슬롯이 그룹의 끝에 있는지 확인
                const isEndSlot = slotKey === clickedGroup[0] || slotKey === clickedGroup[clickedGroup.length - 1];

                if (isEndSlot) {
                    // 끝 슬롯이면 해당 슬롯만 제거
                    newSelectedSlots.delete(slotKey);
                } else {
                    // 중간 슬롯이면 전체 그룹 제거
                    clickedGroup.forEach(key => newSelectedSlots.delete(key));
                }
            }
        } else {
            // 새로운 슬롯을 선택하는 경우
            const groups = getConsecutiveGroups(selectedSlots);

            // 기존 선택된 슬롯들과 연속되는지 확인
            let canAdd = false;
            let targetGroup = null;

            for (const group of groups) {
                const firstSlot = group[0];
                const lastSlot = group[group.length - 1];

                if (isConsecutive(firstSlot, slotKey) || isConsecutive(slotKey, lastSlot)) {
                    canAdd = true;
                    targetGroup = group;
                    break;
                }
            }

            if (canAdd && targetGroup) {
                // 기존 그룹과 연속되는 경우
                if (selectedSlots.size >= 5) {
                    alert("최대 5개까지만 선택할 수 있습니다.");
                    return;
                }
                newSelectedSlots.add(slotKey);
            } else if (selectedSlots.size === 0) {
                // 첫 번째 선택인 경우
                newSelectedSlots.add(slotKey);
            } else {
                // 연속되지 않는 경우
                alert("연속된 시간대만 선택할 수 있습니다.");
                return;
            }
        }

        setSelectedSlots(newSelectedSlots);
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
                                            const isSelected = isSlotSelected(dayIndex, hourIndex);

                                            return (
                                                <div
                                                    key={hourIndex}
                                                    className={`${styles.timeSlot} ${isSelected ? styles.selected : styles[state]} ${!isClickable ? styles.disabled : ''}`}
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

            {/* 대관 신청하기 버튼 */}
            <button
                className={styles.bookingButton}
                onClick={() => {
                    if (selectedSlots.size === 0) {
                        alert("선택된 시간대가 없습니다.");
                        return;
                    }
                    alert("대관 신청이 완료되었습니다!");
                }}
            >
                대관 신청하기
            </button>

            <Footer />
        </div>
    );
} 