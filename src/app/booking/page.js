"use client";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/OnboardingFooter";
import InputField from "../../components/InputField";
import styles from "./page.module.css";
import { setTokens, scheduleAccessTokenRefresh, getAccessToken, getRefreshToken, refreshAccessToken, clearTokens } from "../../utils/auth";
import BookingBoard from "../../components/booking/BookingBoard";

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
    const [requestOrganization, setRequestOrganization] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);
    const [requestError, setRequestError] = useState("");
    const [userInfoLoading, setUserInfoLoading] = useState(false);

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

        // 주차가 변경될 때마다 예약 목록 다시 가져오기
        if (isLoggedIn) {
            const { start, end } = getWeekDateRange(currentWeekStart);
            fetchReservations(start, end);
        }
    }, [currentWeekStart, isLoggedIn]);

    // 예약 상태 타입 정의
    const RESERVATION_STATES = {
        AVAILABLE: 'available',      // 이용 가능 (회색)
        PENDING: 'pending',          // 예약 중 (연빨강)
        CONFIRMED: 'confirmed',      // 예약 완료 (진한 빨강)
        DISABLED: 'disabled'         // 사용 불가 (회색)
    };

    // 예약 데이터 (API에서 가져올 데이터)
    const [reservations, setReservations] = useState({});
    const [reservationsLoading, setReservationsLoading] = useState(false);

    // 선택된 슬롯들 관리
    const [selectedSlots, setSelectedSlots] = useState(new Set());

    // 드래그 상태 관리
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartSlot, setDragStartSlot] = useState(null);
    const [dragMode, setDragMode] = useState('select'); // 'select' or 'cancel'
    const [hasDragged, setHasDragged] = useState(false); // 실제로 드래그가 발생했는지 추적

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

            if (!res.ok) {
                let message = "로그인에 실패했습니다.";
                try {
                    const errData = await res.json();
                    if (errData && typeof errData.detail === "string") {
                        message = errData.detail;
                    }
                } catch { }
                throw new Error(message);
            }

            const data = await res.json().catch(() => ({}));
            const access = data?.access;
            const refresh = data?.refresh;
            if (typeof access !== "string") throw new Error("로그인 응답이 올바르지 않습니다.");

            // 1) 클라이언트 토큰 저장 (client-side API 요청에 사용)
            setTokens(access, refresh);
            scheduleAccessTokenRefresh(access, refresh);

            // 2) 서버 세션/역할 쿠키 설정 (middleware 보호용) - 선택적 처리
            try {
                const sessRes = await fetch("/api/user/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ access, refresh }),
                });
                if (!sessRes.ok) {
                    const errorData = await sessRes.json().catch(() => ({}));
                    console.warn("세션 설정 실패 (무시하고 진행):", sessRes.status, errorData);
                }
            } catch (err) {
                console.warn("세션 설정 에러 (무시하고 진행):", err.message);
            }

            setIsLoggedIn(true);

            // 로그인 성공 후 현재 주차의 예약 목록 가져오기
            const { start, end } = getWeekDateRange(currentWeekStart);
            fetchReservations(start, end);
        } catch (e) {
            setLoginError(e?.message || "로그인에 실패했습니다.");
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
            // 선택된 슬롯을 클릭한 경우
            const groups = getConsecutiveGroups(selectedSlots);
            const clickedGroup = groups.find(group => group.includes(slotKey));

            if (clickedGroup) {
                // 클릭한 슬롯이 그룹의 끝에 있는지 확인
                const isEndSlot = slotKey === clickedGroup[0] || slotKey === clickedGroup[clickedGroup.length - 1];

                if (isEndSlot) {
                    // 끝 슬롯이면 드래그 취소 모드 시작
                    setIsDragging(true);
                    setDragStartSlot({ dayIndex, hourIndex });
                    setDragMode('cancel');
                    setHasDragged(false);
                    return;
                } else {
                    // 중간 슬롯이면 전체 그룹 제거
                    const newSelectedSlots = new Set(selectedSlots);
                    clickedGroup.forEach(key => newSelectedSlots.delete(key));
                    setSelectedSlots(newSelectedSlots);
                    return;
                }
            } else {
                // 그룹에 속하지 않는 슬롯이면 단순히 제거
                const newSelectedSlots = new Set(selectedSlots);
                newSelectedSlots.delete(slotKey);
                setSelectedSlots(newSelectedSlots);
                return;
            }
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
        setDragMode('select');
        setHasDragged(false);
    };

    // 드래그 중
    const handleMouseEnter = (dayIndex, hourIndex) => {
        if (!isDragging || !dragStartSlot) return;

        // 실제로 드래그가 발생했음을 표시
        setHasDragged(true);

        const state = getReservationState(dayIndex, hourIndex);
        if (state !== RESERVATION_STATES.AVAILABLE && dragMode === 'select') return;

        const currentSlot = { dayIndex, hourIndex };

        if (dragMode === 'cancel') {
            // 취소 모드: 드래그하는 범위의 선택된 슬롯들을 취소
            const slotsToCancel = getAllSlotsBetween(dragStartSlot, currentSlot);
            const newSelectedSlots = new Set(selectedSlots);

            for (const slot of slotsToCancel) {
                const slotKey = getSlotKey(slot.dayIndex, slot.hourIndex);
                if (selectedSlots.has(slotKey)) {
                    newSelectedSlots.delete(slotKey);
                }
            }

            setSelectedSlots(newSelectedSlots);
        } else {
            const slotsToSelect = getSlotsBetween(dragStartSlot, currentSlot);
            // 선택 모드: 기존 로직
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
        }
    };

    // 드래그 종료
    const handleMouseUp = () => {
        // 취소 모드에서 드래그하지 않고 클릭만 한 경우 처리
        if (isDragging && dragMode === 'cancel' && dragStartSlot && !hasDragged) {
            // 클릭만 한 경우 해당 슬롯 삭제
            const slotKey = getSlotKey(dragStartSlot.dayIndex, dragStartSlot.hourIndex);
            const newSelectedSlots = new Set(selectedSlots);
            newSelectedSlots.delete(slotKey);
            setSelectedSlots(newSelectedSlots);
        }

        setIsDragging(false);
        setDragStartSlot(null);
        setDragMode('select');
        setHasDragged(false);
    };

    // 선택된 슬롯들에서 시작/끝 시간 계산
    const getSelectedTimeRange = () => {
        if (selectedSlots.size === 0) return null;

        const sortedSlots = Array.from(selectedSlots)
            .map(parseSlotKey)
            .sort((a, b) => {
                if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
                return a.hourIndex - b.hourIndex;
            });

        const firstSlot = sortedSlots[0];
        const lastSlot = sortedSlots[sortedSlots.length - 1];

        // 시작 시간: 첫 번째 슬롯의 시간
        const startDate = new Date(weekDates[firstSlot.dayIndex]);
        startDate.setHours(firstSlot.hourIndex, 0, 0, 0);

        // 끝 시간: 마지막 슬롯의 다음 시간 (1시간 후)
        const endDate = new Date(weekDates[lastSlot.dayIndex]);
        endDate.setHours(lastSlot.hourIndex + 1, 0, 0, 0);

        // 한국 시간대로 포맷 (ISO string with +09:00)
        const formatToKoreanTime = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
        };

        return {
            startTime: formatToKoreanTime(startDate),
            endTime: formatToKoreanTime(endDate)
        };
    };

    // 예약 목록 API 호출
    const fetchReservations = async (startDate, endDate) => {
        if (!isLoggedIn) return;

        setReservationsLoading(true);
        try {
            const access = getAccessToken();
            if (!access) {
                console.warn("토큰이 없어서 예약 목록을 가져올 수 없습니다.");
                return;
            }

            // 주차의 시작/끝 날짜를 한국 시간대(+09:00) 문자열로 변환
            const formatToKoreanTime = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
            };
            const startDateString = formatToKoreanTime(startDate);
            const endDateString = formatToKoreanTime(endDate);

            const response = await fetch(
                `https://dev-api.kucisc.kr/api/room/overview/?start=${encodeURIComponent(startDateString)}&end=${encodeURIComponent(endDateString)}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${access}`
                    }
                }
            );

            if (!response.ok) {
                console.warn("예약 목록을 가져오는데 실패했습니다:", response.status);
                return;
            }

            const reservationData = await response.json();

            // API 응답을 reservations 객체 형태로 변환
            const newReservations = {};

            reservationData.forEach(reservation => {
                const startTime = new Date(reservation.start_time);
                const endTime = new Date(reservation.end_time);

                // 예약이 현재 주차에 속하는지 확인
                if (startTime >= startDate && startTime < endDate) {
                    // 요일 계산 (일요일 = 0)
                    const dayIndex = startTime.getDay();

                    // 시작 시간부터 끝 시간까지의 모든 시간대 표시
                    let currentTime = new Date(startTime);
                    while (currentTime < endTime) {
                        const hour = currentTime.getHours();

                        if (!newReservations[dayIndex]) {
                            newReservations[dayIndex] = {};
                        }

                        // 상태 매핑: API의 status를 우리 시스템의 상태로 변환
                        let status;
                        switch (reservation.status) {
                            case 'PENDING':
                                status = RESERVATION_STATES.PENDING;
                                break;
                            case 'CONFIRMED':
                                status = RESERVATION_STATES.CONFIRMED;
                                break;
                            case 'REJECTED':
                            case 'CANCELLED':
                                status = RESERVATION_STATES.DISABLED;
                                break;
                            default:
                                status = RESERVATION_STATES.PENDING;
                        }

                        newReservations[dayIndex][hour] = status;

                        // 다음 시간으로 이동
                        currentTime.setHours(currentTime.getHours() + 1);
                    }
                }
            });

            setReservations(newReservations);

        } catch (error) {
            console.error("예약 목록 조회 오류:", error);
        } finally {
            setReservationsLoading(false);
        }
    };

    // 주차의 시작/끝 날짜 계산
    const getWeekDateRange = (weekStart) => {
        const sunday = new Date(weekStart);
        sunday.setDate(weekStart.getDate() - weekStart.getDay());
        sunday.setHours(0, 0, 0, 0);

        const nextSunday = new Date(sunday);
        nextSunday.setDate(sunday.getDate() + 7);

        return { start: sunday, end: nextSunday };
    };

    // 현재 사용자 정보 가져오기
    const fetchUserInfo = async () => {
        if (!isLoggedIn) return;

        setUserInfoLoading(true);
        try {
            const access = getAccessToken();
            if (!access) {
                console.warn("토큰이 없어서 사용자 정보를 가져올 수 없습니다.");
                return;
            }

            const response = await fetch('https://dev-api.kucisc.kr/api/account/me/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${access}`
                }
            });

            if (!response.ok) {
                console.warn("사용자 정보를 가져오는데 실패했습니다:", response.status);
                return;
            }

            const userData = await response.json();
            console.log('사용자 정보:', userData);

            // first_name을 단체명으로 설정
            if (userData.first_name) {
                setRequestOrganization(userData.first_name);
            }

        } catch (error) {
            console.error("사용자 정보 조회 오류:", error);
        } finally {
            setUserInfoLoading(false);
        }
    };

    // 대관 신청 API 호출
    const handleReservationSubmit = async () => {
        if (!requestEmail || !requestPurpose) {
            setRequestError("모든 필드를 입력해주세요.");
            return;
        }

        if (selectedSlots.size === 0) {
            setRequestError("예약할 시간을 선택해주세요.");
            return;
        }

        const timeRange = getSelectedTimeRange();
        if (!timeRange) {
            setRequestError("시간 선택에 오류가 있습니다.");
            return;
        }

        setRequestLoading(true);
        setRequestError("");

        try {
            const access = getAccessToken();
            if (!access) {
                throw new Error("로그인이 필요합니다.");
            }

            const requestBody = {
                purpose: requestPurpose,
                contact_email: requestEmail,
                start_time: timeRange.startTime,
                end_time: timeRange.endTime
            };

            console.log('대관 신청 요청:', requestBody);

            const response = await fetch('https://dev-api.kucisc.kr/api/room/reserve/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${access}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const rawText = await response.clone().text().catch(() => '');
                let errorData;
                try {
                    errorData = rawText ? JSON.parse(rawText) : await response.json().catch(() => ({}));
                } catch (e) {
                    errorData = rawText || {};
                }
                console.error('대관 신청 실패 - 상세 정보:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData: errorData,
                    rawText,
                    requestBody: requestBody
                });

                // 에러 데이터가 배열인 경우 첫 번째 항목 확인
                if (Array.isArray(errorData) && errorData.length > 0) {
                    console.error('에러 배열 내용:', errorData);
                    throw new Error(errorData[0] || `HTTP ${response.status}`);
                }

                // 일반적인 에러 처리
                let errorMessage = errorData.detail || errorData.message || errorData.error;

                // 객체인 경우 모든 필드의 에러 메시지 수집
                if (typeof errorData === 'object' && !errorMessage) {
                    const errors = [];
                    Object.keys(errorData).forEach(key => {
                        if (Array.isArray(errorData[key])) {
                            errors.push(`${key}: ${errorData[key].join(', ')}`);
                        } else if (typeof errorData[key] === 'string') {
                            errors.push(`${key}: ${errorData[key]}`);
                        }
                    });
                    errorMessage = errors.length > 0 ? errors.join('; ') : `HTTP ${response.status}`;
                }

                throw new Error(errorMessage || `HTTP ${response.status}`);
            }

            // 성공 처리
            alert("대관 신청이 완료되었습니다!");
            setIsRequestModalOpen(false);
            setRequestEmail("");
            setRequestPurpose("");
            setRequestOrganization("");
            setSelectedSlots(new Set()); // 선택된 슬롯 초기화

            // 예약 목록 다시 가져오기
            const { start, end } = getWeekDateRange(currentWeekStart);
            fetchReservations(start, end);

        } catch (error) {
            console.error('대관 신청 오류:', error);
            setRequestError(error.message || "대관 신청 중 오류가 발생했습니다.");
        } finally {
            setRequestLoading(false);
        }
    };

    // 두 슬롯 사이의 모든 슬롯 가져오기 (드래그 시작점 기준으로 정렬)
    const getSlotsBetween = (startSlot, endSlot) => {
        const slots = [];
        const { dayIndex: startDay, hourIndex: startHour } = startSlot;
        const { dayIndex: endDay, hourIndex: endHour } = endSlot;

        // 시작점과 끝점이 같은 경우 해당 슬롯 하나만 반환
        if (startDay === endDay && startHour === endHour) {
            slots.push({ dayIndex: startDay, hourIndex: startHour });
            return slots;
        }

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

    // 취소 모드를 위한 모든 슬롯 가져오기 (예약 상태 무관)
    const getAllSlotsBetween = (startSlot, endSlot) => {
        const slots = [];
        const { dayIndex: startDay, hourIndex: startHour } = startSlot;
        const { dayIndex: endDay, hourIndex: endHour } = endSlot;

        // 시작점과 끝점이 같은 경우 해당 슬롯 하나만 반환
        if (startDay === endDay && startHour === endHour) {
            slots.push({ dayIndex: startDay, hourIndex: startHour });
            return slots;
        }

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
            // 취소 모드에서는 모든 슬롯을 포함
            slots.push({ dayIndex: currentDay, hourIndex: currentHour });

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
    const isFormValid = isEmailValid && requestPurpose.trim() !== "";

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

                    <div className={styles.bookingBoardContainer}>
                        {/* 이전 주 버튼 */}
                        <button
                            className={styles.weekNavigationButton}
                            onClick={goToPreviousWeek}
                            aria-label="이전 주"
                        >
                            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* 중앙 그룹: 시간 컬럼 + BookingBoard */}
                        <div className={styles.centerGroup}>
                            {/* 시간 컬럼 */}
                            <div className={styles.timeColumn}>
                                {Array.from({ length: 24 }, (_, i) => (
                                    <div key={i} className={styles.timeLabel}>
                                        {i === 0 ? "12AM" : i === 12 ? "12PM" : i > 12 ? `${i - 12}PM` : `${i}AM`}
                                    </div>
                                ))}
                            </div>

                            {reservationsLoading ? (
                                <div className={styles.loadingMessage}>
                                    예약 정보를 불러오는 중...
                                </div>
                            ) : (
                                <BookingBoard
                                    weekDates={weekDates}
                                    selectedDayIndex={selectedDayIndex}
                                    onSelectDay={setSelectedDayIndex}
                                    reservations={reservations}
                                    selectedSlots={selectedSlots}
                                    onSlotMouseDown={handleMouseDown}
                                    onSlotMouseEnter={handleMouseEnter}
                                    onSlotMouseUp={handleMouseUp}
                                    RESERVATION_STATES={RESERVATION_STATES}
                                />
                            )}
                        </div>

                        {/* 다음 주 버튼 */}
                        <button
                            className={styles.weekNavigationButton}
                            onClick={goToNextWeek}
                            aria-label="다음 주"
                        >
                            <svg width="10" height="20" viewBox="0 0 10 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 18L8 10L0 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
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
                className={`${styles.bookingButton} ${selectedSlots.size === 0 ? styles.disabled : ''}`}
                onClick={() => {
                    if (selectedSlots.size === 0) return;
                    setIsRequestModalOpen(true);
                    setRequestError(""); // 모달 열 때 에러 초기화
                    fetchUserInfo(); // 사용자 정보 가져오기
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
                            {requestOrganization && (
                                <div className={styles.formGroup}>
                                    <label>단체명</label>
                                    <input
                                        type="text"
                                        placeholder="단체명"
                                        value={requestOrganization}
                                        disabled={true}
                                        className={styles.disabledInput}
                                    />
                                    <small className={styles.helperText}>
                                        현재 계정으로 신청됩니다
                                    </small>
                                </div>
                            )}
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
                        {requestError && (
                            <div className={styles.errorMessage}>
                                {requestError}
                            </div>
                        )}
                        <div className={styles.modalActions}>
                            <button
                                className={styles.secondaryButton}
                                onClick={() => {
                                    setIsRequestModalOpen(false);
                                    setRequestError("");
                                    setRequestOrganization("");
                                }}
                            >
                                취소
                            </button>
                            <button
                                className={styles.primaryButton}
                                disabled={!isFormValid || requestLoading}
                                onClick={handleReservationSubmit}
                            >
                                {requestLoading ? "신청 중..." : "대관 신청하기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
} 