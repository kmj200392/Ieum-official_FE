"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Header from "../../components/Header";
import Footer from "../../components/OnboardingFooter";
import InputField from "../../components/InputField";
import LockerAccordion from "../../components/LockerAccordion";
import LockerGrid from "../../components/LockerGrid";
import LockerLegend from "../../components/LockerLegend";
import { LockerState } from "../../components/LockerGrid";
import styles from "./page.module.css";
import GlassContainer from "../../components/GlassContainer";
import { setLockerAccessToken, getLockerAccessToken } from "../../utils/auth";

export default function LockersPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [formData, setFormData] = useState({
        studentId: "",
        name: "",
        phone: ""
    });
    const [loginError, setLoginError] = useState("");
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [openLocationId, setOpenLocationId] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [actionError, setActionError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [portalEl, setPortalEl] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [releaseLoading, setReleaseLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [lockerLocations, setLockerLocations] = useState([]);
    const [lockersLoading, setLockersLoading] = useState(false);

    useEffect(() => {
        if (typeof document === "undefined") return;
        setPortalEl(document.getElementById("portal-root"));
    }, []);

    // 모달 활성화 시 Booking과 동일하게 body 배경 블러 처리
    useEffect(() => {
        if (typeof document === "undefined") return;
        if (isConfirmOpen) {
            document.body.classList.add("sidebar-open");
        } else {
            document.body.classList.remove("sidebar-open");
        }
        return () => document.body.classList.remove("sidebar-open");
    }, [isConfirmOpen]);

    // lockers 목록을 불러오는 공용 함수
    const fetchLockers = useCallback(async () => {
        const token = getLockerAccessToken();
        if (!token) return;
        setLockersLoading(true);
        setActionError("");
        try {
            const res = await fetch("https://locker-api.kucisc.kr/api/v1/lockers", {
                method: "GET",
                headers: { accept: "application/json", Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data?.message || "사물함 목록을 불러오지 못했습니다.");
            }
            const list = Array.isArray(data?.lockers) ? data.lockers : [];
            const locationToItems = new Map();
            list.forEach((item) => {
                const loc = item.location_id || "기타";
                if (!locationToItems.has(loc)) locationToItems.set(loc, []);
                locationToItems.get(loc).push(item);
            });

            const parseRowCol = (lockerId) => {
                const s = String(lockerId);
                const row = Number(s.slice(1, 2));
                const col = Number(s.slice(2));
                return { row, col };
            };

            const builtLocations = [];
            for (const [locTitle, items] of locationToItems.entries()) {
                let maxCol = 0;
                const cellMap = new Map();
                items.forEach((it) => {
                    const { row, col } = parseRowCol(it.locker_id);
                    maxCol = Math.max(maxCol, col);
                    cellMap.set(`${row}-${col}`, it);
                });
                const lockers = [];
                for (let r = 1; r <= 4; r++) {
                    for (let c = 1; c <= maxCol; c++) {
                        const real = cellMap.get(`${r}-${c}`);
                        if (real) {
                            const hasOwner = !!real.owner;
                            lockers.push({
                                id: `locker-${real.locker_id}`,
                                number: real.locker_id,
                                state: hasOwner ? LockerState.ASSIGNED : LockerState.AVAILABLE,
                            });
                        } else {
                            lockers.push({ id: `ghost-${locTitle}-${r}-${c}`, number: "", state: LockerState.DISABLED });
                        }
                    }
                }
                builtLocations.push({ id: `loc-${locTitle}`, title: locTitle, columns: maxCol || 1, lockers });
            }
            setLockerLocations(builtLocations);
        } catch (e) {
            setActionError(e?.message || "사물함 목록 로딩 중 오류가 발생했습니다.");
        } finally {
            setLockersLoading(false);
        }
    }, []);

    // 로그인 후 최초 로딩
    useEffect(() => {
        if (isLoggedIn) fetchLockers();
    }, [isLoggedIn, fetchLockers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (loginError) setLoginError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        const payload = {
            name: formData.name?.trim(),
            phone_number: String(formData.phone || "").replace(/[^0-9]/g, ""),
            student_id: formData.studentId?.trim(),
        };
        if (!payload.name || !payload.phone_number || !payload.student_id) {
            setLoginError("학번, 이름, 전화번호를 모두 입력해 주세요.");
            return;
        }
        try {
            const res = await fetch("/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json", accept: "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.ok) {
                setLoginError(data?.message || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
                return;
            }
            const lockerToken = data?.data?.access_token || data?.data?.token || data?.data?.accessToken;
            if (lockerToken) setLockerAccessToken(lockerToken);
            setIsLoggedIn(true);
        } catch (err) {
            setLoginError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    };

    const handleLockerSelect = (lockerId) => {
        setSelectedLocker(lockerId);
    };

    const handleAccordionToggle = (id, nextOpen) => {
        if (nextOpen) {
            setOpenLocationId(id);
        } else if (openLocationId === id) {
            setOpenLocationId(null);
        }
    };

    const openConfirm = () => {
        setActionError("");
        setIsConfirmOpen(true);
    };

    const closeConfirm = () => {
        if (actionLoading) return;
        setIsConfirmOpen(false);
    };

    const getSelectedLockerNumber = () => Number(String(selectedLocker).replace("locker-", ""));

    // 신청 버튼에서 즉시 모달 오픈 + API 호출 동시 수행
    const startApply = () => {
        if (actionLoading || releaseLoading || confirmLoading) return;
        setSuccessMessage("");
        setActionError("");
        setIsConfirmOpen(true);
        handleHoldLocker();
    };

    const handleHoldLocker = async () => {
        if (!selectedLocker) return;
        const lockerNumber = getSelectedLockerNumber();
        const token = getLockerAccessToken();
        if (!token) {
            setActionError("인증 토큰이 없습니다. 다시 로그인해 주세요.");
            return;
        }
        setActionLoading(true);
        setActionError("");
        setSuccessMessage("");
        try {
            const res = await fetch(`https://locker-api.kucisc.kr/api/v1/lockers/${lockerNumber}/hold`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await res.json().catch(() => ({}));
            if (!res.ok) {
                const message = result?.message || "신청에 실패했습니다. 잠시 후 다시 시도해 주세요.";
                throw new Error(message);
            }
            const expiresIn = result?.expires_in;
            const expiresOn = result?.expires_on || result?.expires_at;
            let messageText = "";
            if (typeof expiresIn === "string" && expiresIn.trim().length > 0) {
                const lower = expiresIn.toLowerCase();
                const numMatch = lower.match(/\d+/);
                const num = numMatch ? numMatch[0] : "";
                if (lower.includes("min")) messageText = `${num}분 후 신청이 자동 취소됩니다.`;
                else if (lower.includes("hour")) messageText = `${num}시간 후 신청이 자동 취소됩니다.`;
                else if (lower.includes("sec")) messageText = `${num}초 후 신청이 자동 취소됩니다.`;
                else messageText = `${expiresIn} 후 신청이 자동 취소됩니다.`;
            } else if (typeof expiresOn === "string") {
                const now = Date.now();
                const end = new Date(expiresOn).getTime();
                const diffMs = Math.max(end - now, 0);
                const mins = Math.floor(diffMs / 60000);
                const secs = Math.round((diffMs % 60000) / 1000);
                if (mins > 0) messageText = `약 ${mins}분 후 신청이 자동 취소됩니다.`;
                else messageText = `약 ${secs}초 후 신청이 자동 취소됩니다.`;
            }
            setSuccessMessage(messageText);
        } catch (e) {
            setActionError(e?.message || "요청 중 오류가 발생했습니다.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReleaseHold = async () => {
        if (!selectedLocker) return closeConfirm();
        const lockerNumber = getSelectedLockerNumber();
        const token = getLockerAccessToken();
        if (!token) return closeConfirm();
        setReleaseLoading(true);
        setActionError("");
        try {
            const res = await fetch(`https://locker-api.kucisc.kr/api/v1/lockers/${lockerNumber}/release-hold`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            await res.json().catch(() => ({}));
        } catch { }
        finally {
            setReleaseLoading(false);
            setIsConfirmOpen(false);
            setSuccessMessage("");
            setSelectedLocker(null);
        }
    };

    const handleConfirm = async () => {
        if (!selectedLocker) return;
        const lockerNumber = getSelectedLockerNumber();
        const token = getLockerAccessToken();
        if (!token) return;
        setConfirmLoading(true);
        setActionError("");
        try {
            const res = await fetch(`https://locker-api.kucisc.kr/api/v1/lockers/${lockerNumber}/confirm`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await res.json().catch(() => ({}));
            if (!res.ok) {
                const message = result?.message || "확정에 실패했습니다. 잠시 후 다시 시도해 주세요.";
                throw new Error(message);
            }
            setIsConfirmOpen(false);
            setSuccessMessage("");
            setSelectedLocker(null);
            alert("사물함 신청이 확정되었습니다.");
            // 확정 후 최신 상태로 목록 갱신
            fetchLockers();
        } catch (e) {
            setActionError(e?.message || "요청 중 오류가 발생했습니다.");
        } finally {
            setConfirmLoading(false);
        }
    };

    // 로그인 전 화면
    if (!isLoggedIn) {
        return (
            <div className={styles.container}>
                <Header />
                <main className={styles.main}>
                    <h1 className={styles.title}>사물함 신청</h1>
                    <p className={styles.subtitle}>
                        부정한 방법으로 사물함을 신청한 것이 적발될 시
                        <br />
                        영구적으로 사물함 신청 권한이 박탈될 수 있습니다.
                    </p>
                    <GlassContainer as="form" radius={50} padding={50} variant="container" onSubmit={handleLogin} className={styles.glassContainer}>
                        <div className={styles.inputGroup}>
                            <div className={styles.inputField}>
                                <InputField
                                    id="studentId"
                                    name="studentId"
                                    label="학번"
                                    placeholder="20**320***"
                                    value={formData.studentId}
                                    onChange={(e) => setFormData((p) => ({ ...p, studentId: e.target.value }))}
                                    required
                                    error={loginError}
                                />
                            </div>
                            <div className={styles.inputField}>
                                <InputField
                                    id="name"
                                    name="name"
                                    label="이름"
                                    placeholder="홍길동"
                                    value={formData.name}
                                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className={styles.inputField}>
                                <InputField
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    label="전화번호"
                                    placeholder="01012345678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                                    required
                                    autoComplete="tel"
                                />
                            </div>
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
                        <LockerLegend />

                        <div className={styles.accordionContainer}>
                            {(lockerLocations.length ? lockerLocations : []).map((location) => (
                                <LockerAccordion
                                    key={location.id}
                                    title={location.title}
                                    isOpen={openLocationId === location.id}
                                    onToggle={(next) => setOpenLocationId(next ? location.id : null)}
                                >
                                    <LockerGrid
                                        lockers={location.lockers}
                                        selectedLocker={selectedLocker}
                                        onLockerSelect={setSelectedLocker}
                                        columns={location.columns}
                                    />
                                </LockerAccordion>
                            ))}
                            {lockersLoading && <div style={{ textAlign: 'center', color: '#5C5C5C' }}>사물함 목록을 불러오는 중...</div>}
                            {!lockersLoading && lockerLocations.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#5C5C5C' }}>표시할 사물함이 없습니다.</div>
                            )}
                        </div>

                        {selectedLocker && (
                            <button
                                className={styles.applyButton}
                                onClick={startApply}
                            >
                                사물함 신청하기
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {portalEl && createPortal(
                <div
                    className={`${styles.modalOverlay} ${isConfirmOpen ? styles.active : ''}`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            if (!releaseLoading && !actionLoading && !confirmLoading) {
                                handleReleaseHold();
                            }
                        }
                    }}
                >
                    <GlassContainer radius={50} padding={50} variant="modal" className={styles.glassModal}>
                        <h2 className={styles.glassModalTitle}>이 사물함을 신청하시겠습니까?</h2>

                        {successMessage && (
                            <div className={styles.glassModalBody}>
                                <p className={styles.expiryNotice}>{successMessage}</p>
                            </div>
                        )}

                        {actionError && (
                            <div className={styles.errorMessage}>{actionError}</div>
                        )}

                        <div className={styles.glassModalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={handleReleaseHold}
                                disabled={actionLoading || releaseLoading || confirmLoading}
                            >
                                취소
                            </button>
                            <button
                                className={styles.submitButton}
                                onClick={handleConfirm}
                                disabled={actionLoading || releaseLoading || confirmLoading}
                            >
                                {confirmLoading ? "신청 중..." : "신청하기"}
                            </button>
                        </div>
                    </GlassContainer>
                </div>,
                portalEl
            )}

            <Footer />
        </div>
    );
} 