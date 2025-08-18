"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/OnboardingFooter";
import InputField from "../../components/InputField";
import styles from "./page.module.css";
import { setTokens, scheduleAccessTokenRefresh, getAccessToken, getRefreshToken, refreshAccessToken, clearTokens } from "../../utils/auth";
import BookingBoard from "../../components/BookingBoard";

export default function BookingPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    // 토큰 존재 시 자동 로그인 처리
    useEffect(() => {
        const bootstrap = async () => {
            try {
                const access = getAccessToken();
                const refresh = getRefreshToken();
                if (access) {
                    scheduleAccessTokenRefresh(access, refresh);
                    setIsLoggedIn(true);
                    return;
                }
                if (refresh) {
                    const newAccess = await refreshAccessToken();
                    scheduleAccessTokenRefresh(newAccess, refresh);
                    setIsLoggedIn(true);
                    return;
                }
            } catch {
                clearTokens();
            } finally {
                setAuthReady(true);
            }
        };
        bootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 현재 날짜 기준으로 일주일 날짜 계산
    const [weekDates, setWeekDates] = useState([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    // 모달 상태
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestEmail, setRequestEmail] = useState("");
    const [requestPurpose, setRequestPurpose] = useState("");

    // 일주일 날짜 계산 함수
    const calculateWeekDates = (weekStart) => {
        const weekDates = [];
        const sunday = new Date(weekStart);
        sunday.setDate(weekStart.getDate() - weekStart.getDay());

        for (let i = 0; i < 7; i++) {
            const date = new Date(sunday);
            date.setDate(sunday.getDate() + i);
            weekDates.push(date);
        }

        return weekDates;
    };

    // 이전 주로 이동
    const goToPreviousWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(newWeekStart);
    };

    // 다음 주로 이동
    const goToNextWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(newWeekStart);
    };

    useEffect(() => {
        const weekDates = calculateWeekDates(currentWeekStart);
        setWeekDates(weekDates);
    }, [currentWeekStart]);

    // 예약 상태 타입 정의
    const RESERVATION_STATES = {
        AVAILABLE: 'available',      // 이용 가능 (회색)
        PENDING: 'pending',          // 예약 중 (연빨강)
        CONFIRMED: 'confirmed',      // 예약 완료 (진한 빨강)
        DISABLED: 'disabled'         // 사용 불가 (회색)
    };

    // 임시 예약 데이터 (실제로는 API에서 가져올 데이터)
    const [reservations, setReservations] = useState({
        // 예시: {dayIndex: {hourIndex: state}}
        0: { 3: RESERVATION_STATES.PENDING, 4: RESERVATION_STATES.PENDING, 5: RESERVATION_STATES.PENDING, 6: RESERVATION_STATES.PENDING, 7: RESERVATION_STATES.PENDING }, // SUN 3AM-7AM 예약 중
        1: { 10: RESERVATION_STATES.CONFIRMED, 11: RESERVATION_STATES.CONFIRMED, 12: RESERVATION_STATES.CONFIRMED }, // MON 10AM-12PM 예약 완료
        2: { 15: RESERVATION_STATES.PENDING, 16: RESERVATION_STATES.PENDING, 18: RESERVATION_STATES.DISABLED, 19: RESERVATION_STATES.DISABLED }, // TUE 3PM-4PM 예약 중, 6PM-7PM 사용불가
        3: { 9: RESERVATION_STATES.DISABLED, 14: RESERVATION_STATES.CONFIRMED, 15: RESERVATION_STATES.CONFIRMED }, // WED 9AM 사용불가, 2PM-3PM 예약완료
    });

    // 선택된 슬롯들 관리
    const [selectedSlots, setSelectedSlots] = useState(new Set());

    // 드래그 상태 관리
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartSlot, setDragStartSlot] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (loginError) setLoginError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoading(true);
        try {
            const res = await fetch("https://dev-api.kucisc.kr/api/account/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });

            const status = res.status;

            if (!res.ok) {
                let message = "로그인에 실패했습니다.";
                try {
                    const errData = await res.json();
                    // API 문서: 400/401 => { detail: string }
                    if (errData && typeof errData.detail === "string") {
                        message = errData.detail;
                    }
                } catch { }
                setLoginError(message);
                return;
            }

            // 성공: { refresh, access }
            let data = null;
            try { data = await res.json(); } catch { }

            const access = data?.access;
            const refresh = data?.refresh;

            if (typeof access === "string") {
                setTokens(access, refresh);
                scheduleAccessTokenRefresh(access, refresh);
                setIsLoggedIn(true);
            } else {
                setLoginError("로그인 응답 형식이 올바르지 않습니다.");
            }
        } catch (err) {
            setLoginError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setLoading(false);
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

    // 드래그 시작 (클릭도 포함)
    const handleMouseDown = (dayIndex, hourIndex) => {
        const state = getReservationState(dayIndex, hourIndex);
        if (state !== RESERVATION_STATES.AVAILABLE) return;

        const slotKey = getSlotKey(dayIndex, hourIndex);

        // 클릭한 슬롯이 이미 선택되어 있는지 확인
        if (selectedSlots.has(slotKey)) {
            // 선택된 슬롯을 클릭한 경우 - 삭제
            const groups = getConsecutiveGroups(selectedSlots);
            const clickedGroup = groups.find(group => group.includes(slotKey));

            const newSelectedSlots = new Set(selectedSlots);

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
            } else {
                // 그룹에 속하지 않는 슬롯이면 단순히 제거
                newSelectedSlots.delete(slotKey);
            }

            setSelectedSlots(newSelectedSlots);
            return;
        }

        // 새로운 슬롯을 선택하는 경우
        // 기존 선택된 슬롯이 있는지 확인
        if (selectedSlots.size > 0) {
            const groups = getConsecutiveGroups(selectedSlots);
            let canAdd = false;

            for (const group of groups) {
                const firstSlot = group[0];
                const lastSlot = group[group.length - 1];

                if (isConsecutive(firstSlot, slotKey) || isConsecutive(slotKey, lastSlot)) {
                    canAdd = true;
                    break;
                }
            }

            if (!canAdd) {
                alert("연속된 시간대만 선택할 수 있습니다.");
                return;
            }

            if (selectedSlots.size >= 5) {
                alert("최대 5개까지만 선택할 수 있습니다.");
                return;
            }
        }

        // 새로운 슬롯 즉시 선택
        const newSelectedSlots = new Set(selectedSlots);
        newSelectedSlots.add(slotKey);
        setSelectedSlots(newSelectedSlots);

        // 드래그 시작
        setIsDragging(true);
        setDragStartSlot({ dayIndex, hourIndex });
    };

    // 드래그 중
    const handleMouseEnter = (dayIndex, hourIndex) => {
        if (!isDragging || !dragStartSlot) return;

        const state = getReservationState(dayIndex, hourIndex);
        if (state !== RESERVATION_STATES.AVAILABLE) return;

        const currentSlot = { dayIndex, hourIndex };
        const slotsToSelect = getSlotsBetween(dragStartSlot, currentSlot);

        // 연속된 슬롯만 선택 (최대 5개)
        const limitedSlots = slotsToSelect.slice(0, 5);

        // 드래그로 선택할 슬롯들
        const dragSelectedSlots = new Set();

        for (const slot of limitedSlots) {
            const slotKey = getSlotKey(slot.dayIndex, slot.hourIndex);

            if (dragSelectedSlots.size === 0) {
                // 첫 번째 슬롯은 항상 추가 가능
                dragSelectedSlots.add(slotKey);
            } else {
                // 이전 슬롯과 연속되는지 확인
                const prevSlotKey = Array.from(dragSelectedSlots).pop();
                if (isConsecutive(prevSlotKey, slotKey)) {
                    dragSelectedSlots.add(slotKey);
                } else {
                    // 연속되지 않으면 더 이상 추가하지 않음
                    break;
                }
            }
        }

        // 기존 선택된 슬롯들과 드래그로 선택된 슬롯들을 합침
        const allSelectedSlots = new Set([...selectedSlots, ...dragSelectedSlots]);

        // 최대 5개까지만 유지
        const finalSelectedSlots = new Set(Array.from(allSelectedSlots).slice(0, 5));

        setSelectedSlots(finalSelectedSlots);
    };

    // 드래그 종료
    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStartSlot(null);
    };

    // 두 슬롯 사이의 모든 슬롯 가져오기 (드래그 시작점 기준으로 정렬)
    const getSlotsBetween = (startSlot, endSlot) => {
        const slots = [];
        const { dayIndex: startDay, hourIndex: startHour } = startSlot;
        const { dayIndex: endDay, hourIndex: endHour } = endSlot;

        // 드래그 시작점부터 끝점까지의 모든 슬롯을 시간 순서대로 수집
        let currentDay = startDay;
        let currentHour = startHour;
        let targetDay = endDay;
        let targetHour = endHour;

        // 시작점이 끝점보다 늦은 시간인 경우 순서를 바꿈
        const startTime = startDay * 24 + startHour;
        const endTime = endDay * 24 + endHour;

        if (startTime > endTime) {
            // 순서를 바꿈
            currentDay = endDay;
            currentHour = endHour;
            targetDay = startDay;
            targetHour = startHour;
        }

        while (true) {
            const state = getReservationState(currentDay, currentHour);

            if (state === RESERVATION_STATES.AVAILABLE) {
                slots.push({ dayIndex: currentDay, hourIndex: currentHour });
            }

            // 목표 지점에 도달했는지 확인
            if (currentDay === targetDay && currentHour === targetHour) break;

            // 다음 시간으로 이동
            currentHour++;
            if (currentHour >= 24) {
                currentHour = 0;
                currentDay = (currentDay + 1) % 7;
            }
        }

        // 드래그 시작점이 끝점보다 늦은 경우 배열을 뒤집어서 시작점부터 시작하도록 함
        if (startTime > endTime) {
            slots.reverse();
        }

        return slots;
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
            // 이미 선택된 슬롯을 클릭한 경우 - 무조건 삭제
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
            } else {
                // 그룹에 속하지 않는 슬롯이면 단순히 제거
                newSelectedSlots.delete(slotKey);
            }
        } else {
            // 새로운 슬롯을 선택하는 경우 - 연속된 슬롯만 선택 가능
            console.log("새로운 슬롯 선택 시도");
            const groups = getConsecutiveGroups(selectedSlots);

            // 기존 선택된 슬롯들과 연속되는지 확인
            let canAdd = false;

            for (const group of groups) {
                const firstSlot = group[0];
                const lastSlot = group[group.length - 1];

                if (isConsecutive(firstSlot, slotKey) || isConsecutive(slotKey, lastSlot)) {
                    canAdd = true;
                    break;
                }
            }

            if (canAdd || selectedSlots.size === 0) {
                // 연속되는 경우이거나 첫 번째 선택인 경우
                if (selectedSlots.size >= 5) {
                    alert("최대 5개까지만 선택할 수 있습니다.");
                    return;
                }
                newSelectedSlots.add(slotKey);
            } else {
                // 연속되지 않는 경우
                alert("연속된 시간대만 선택할 수 있습니다.");
                return;
            }
        }

        setSelectedSlots(newSelectedSlots);
    };

    // 선택한 시간 범위 포맷팅
    const formatDateLabel = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        return `${yyyy}.${mm}.${dd} ${hh}:00`;
    };

    const getSelectedRange = () => {
        if (selectedSlots.size === 0 || weekDates.length !== 7) return { startLabel: '', endLabel: '' };
        const sorted = Array.from(selectedSlots).sort((a, b) => {
            const { dayIndex: da, hourIndex: ha } = parseSlotKey(a);
            const { dayIndex: db, hourIndex: hb } = parseSlotKey(b);
            if (da !== db) return da - db;
            return ha - hb;
        });
        const first = parseSlotKey(sorted[0]);
        const last = parseSlotKey(sorted[sorted.length - 1]);

        const start = new Date(weekDates[first.dayIndex]);
        start.setHours(first.hourIndex, 0, 0, 0);
        const end = new Date(weekDates[last.dayIndex]);
        end.setHours(last.hourIndex + 1, 0, 0, 0); // 마지막 슬롯의 끝 시각

        return { startLabel: formatDateLabel(start), endLabel: formatDateLabel(end) };
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(requestEmail);

    // 1) 아직 토큰 확인 중이면 아무 것도 렌더링하지 않음 (깜빡임 방지)
    if (!authReady) {
        return null;
    }

    // 2) 토큰 확인 완료 후, 비로그인 상태면 로그인 화면 렌더
    if (!isLoggedIn) {
        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.main}>
                    <h1 className={styles.title}>학생회실 대관</h1>
                    <p className={styles.subtitle}>
                        학생회실 대관은 정보대학 학생회, 산하기구 학생회,<br />
                        정보대학 동아리연합회 소속 동아리,<br />
                        정보대학 산하기구 소속 소모임만 가능합니다.
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
                                inputClassName=""
                                disabled={loading}
                                autoComplete="username"
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
                                inputClassName=""
                                disabled={loading}
                                autoComplete="current-password"
                                error={loginError}
                            />
                        </div>
                        <button type="submit" className={styles.loginButton} disabled={loading}>{loading ? "로그인 중..." : "로그인"}</button>
                    </form>
                </main>
                <Footer />
            </div>
        );
    }

    // 3) 로그인 상태면 원래 예약 화면 렌더
    const { startLabel, endLabel } = getSelectedRange();

    return (
        <div className={styles.container}>
            <Header variant="simple" showMyReservation />

            <main className={styles.main} onMouseUp={handleMouseUp}>
                <div className={styles.bookingPageContainer}>
                    <div className={styles.headerSection}>
                        <h1 className={styles.title}>학생회실 대관</h1>
                    </div>

                    <BookingBoard
                        weekDates={weekDates}
                        selectedDayIndex={selectedDayIndex}
                        onPrevWeek={goToPreviousWeek}
                        onNextWeek={goToNextWeek}
                        onSelectDay={setSelectedDayIndex}
                        reservations={reservations}
                        selectedSlots={selectedSlots}
                        onSlotMouseDown={handleMouseDown}
                        onSlotMouseEnter={handleMouseEnter}
                        onSlotMouseUp={handleMouseUp}
                        RESERVATION_STATES={RESERVATION_STATES}
                    />

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
                className={`${styles.bookingButton} ${selectedSlots.size === 0 ? styles.disabled : ''}`}
                onClick={() => {
                    if (selectedSlots.size === 0) return;
                    setIsRequestModalOpen(true);
                }}
                disabled={selectedSlots.size === 0}
            >
                대관 신청하기
            </button>

            {/* 대관 신청 모달 */}
            {isRequestModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>대관 신청</h2>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>대관 시작 시간</label>
                                <input type="text" placeholder={startLabel} disabled />
                            </div>
                            <div className={styles.formGroup}>
                                <label>대관 종료 시간</label>
                                <input type="text" placeholder={endLabel} disabled />
                            </div>
                            <div className={styles.formGroup}>
                                <label>단체명</label>
                                <input type="text" placeholder="정보대학 학생회" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>대관 목적</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="대관 목적을 입력해 주세요"
                                    value={requestPurpose}
                                    onChange={(e) => setRequestPurpose(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>이메일</label>
                                <input
                                    type="email"
                                    placeholder="example@korea.ac.kr"
                                    value={requestEmail}
                                    onChange={(e) => setRequestEmail(e.target.value)}
                                />
                                {!isEmailValid && requestEmail.length > 0 && (
                                    <span className={styles.helperText}>올바른 이메일 형식이 아닙니다.</span>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => setIsRequestModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                className={styles.primaryButton}
                                disabled={!isEmailValid}
                                onClick={() => {
                                    if (!isEmailValid) return;
                                    alert("대관 신청이 완료되었습니다!");
                                    setIsRequestModalOpen(false);
                                }}
                            >
                                대관 신청하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
} 