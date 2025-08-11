"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

const initialBookings = [
    {
        id: 20250001,
        organizationName: "정보대학 학생회",
        applicantName: "홍길동",
        phone: "010-1234-5678",
        roomName: "학생회실 A",
        startDateTime: new Date().setHours(10, 0, 0, 0),
        endDateTime: new Date().setHours(12, 0, 0, 0),
        submittedAt: new Date().getTime() - 1000 * 60 * 60 * 20,
        status: "pending",
        purpose: "정기 회의",
        memo: "빔프로젝터 사용 예정",
    },
    {
        id: 20250002,
        organizationName: "정보대학 운영팀",
        applicantName: "김지원",
        phone: "010-2222-3333",
        roomName: "학생회실 B",
        startDateTime: new Date().setDate(new Date().getDate() + 1),
        endDateTime: new Date().setDate(new Date().getDate() + 1),
        submittedAt: new Date().getTime() - 1000 * 60 * 60 * 2,
        status: "approved",
        purpose: "행사 준비회의",
        memo: "간식 반입",
    },
    {
        id: 20250003,
        organizationName: "정보대학 동아리연합",
        applicantName: "이서준",
        phone: "010-9876-5432",
        roomName: "학생회실 A",
        startDateTime: new Date().setDate(new Date().getDate() - 1),
        endDateTime: new Date().setDate(new Date().getDate() - 1),
        submittedAt: new Date().getTime() - 1000 * 60 * 60 * 48,
        status: "rejected",
        purpose: "번개 모임",
        memo: "시간대 중복",
    },
];

function formatDateTime(ms) {
    try {
        const d = new Date(ms);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch {
        return "-";
    }
}

function StatusBadge({ status }) {
    const className =
        status === "approved" ? styles.badgeApproved : status === "rejected" ? styles.badgeRejected : styles.badgePending;
    const label = status === "approved" ? "승인" : status === "rejected" ? "반려" : "대기";
    return <span className={`${styles.badge} ${className}`}>{label}</span>;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState(initialBookings);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all | pending | approved | rejected
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [detailBooking, setDetailBooking] = useState(null);
    const [rejectBooking, setRejectBooking] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    const filtered = useMemo(() => {
        return bookings
            .filter((b) => {
                if (statusFilter !== "all" && b.status !== statusFilter) return false;
                if (keyword) {
                    const hay = `${b.id} ${b.organizationName} ${b.applicantName} ${b.roomName}`.toLowerCase();
                    if (!hay.includes(keyword.toLowerCase())) return false;
                }
                if (dateFrom) {
                    const fromMs = new Date(dateFrom).setHours(0, 0, 0, 0);
                    if (b.startDateTime < fromMs) return false;
                }
                if (dateTo) {
                    const toMs = new Date(dateTo).setHours(23, 59, 59, 999);
                    if (b.startDateTime > toMs) return false;
                }
                return true;
            })
            .sort((a, b) => b.submittedAt - a.submittedAt);
    }, [bookings, keyword, statusFilter, dateFrom, dateTo]);

    const approve = (targetId) => {
        setBookings((prev) => prev.map((b) => (b.id === targetId ? { ...b, status: "approved" } : b)));
    };

    const openReject = (booking) => {
        setRejectBooking(booking);
        setRejectReason("");
    };

    const confirmReject = () => {
        if (!rejectBooking) return;
        setBookings((prev) =>
            prev.map((b) => (b.id === rejectBooking.id ? { ...b, status: "rejected", memo: rejectReason || b.memo } : b))
        );
        setRejectBooking(null);
        setRejectReason("");
    };

    const removeBooking = (targetId) => {
        setBookings((prev) => prev.filter((b) => b.id !== targetId));
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>학생회실 대관</h2>
                <div className={styles.headerActions}>
                    <input
                        className={styles.searchInput}
                        placeholder="검색: 신청자/단체/공간/예약번호"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <select
                        className={styles.select}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="상태 필터"
                    >
                        <option value="all">전체</option>
                        <option value="pending">대기</option>
                        <option value="approved">승인</option>
                        <option value="rejected">반려</option>
                    </select>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        aria-label="시작일"
                    />
                    <span className={styles.tilde}>~</span>
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        aria-label="종료일"
                    />
                </div>
            </div>

            <div className={styles.table}>
                <div className={`${styles.row} ${styles.header}`}>
                    <div>예약번호</div>
                    <div>단체/신청자</div>
                    <div>공간</div>
                    <div>사용일시</div>
                    <div>상태</div>
                    <div>신청일</div>
                    <div>액션</div>
                </div>
                {filtered.map((b) => (
                    <div key={b.id} className={styles.row}>
                        <div>#{b.id}</div>
                        <div>
                            <div className={styles.bold}>{b.organizationName}</div>
                            <div className={styles.sub}>{b.applicantName} · {b.phone}</div>
                        </div>
                        <div>{b.roomName}</div>
                        <div>
                            <div>{formatDateTime(b.startDateTime)}</div>
                            <div className={styles.sub}>~ {formatDateTime(b.endDateTime)}</div>
                        </div>
                        <div><StatusBadge status={b.status} /></div>
                        <div>{formatDateTime(b.submittedAt)}</div>
                        <div className={styles.actions}>
                            <button className={styles.secondaryButton} onClick={() => setDetailBooking(b)}>상세</button>
                            {b.status !== "approved" && (
                                <button className={styles.primaryButton} onClick={() => approve(b.id)}>승인</button>
                            )}
                            {b.status !== "rejected" && (
                                <button className={styles.warningButton} onClick={() => openReject(b)}>반려</button>
                            )}
                            <button className={styles.dangerButton} onClick={() => removeBooking(b.id)}>삭제</button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className={styles.empty}>
                        조건에 맞는 대관 신청이 없습니다.
                    </div>
                )}
            </div>

            {detailBooking && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>신청 상세 #{detailBooking.id}</h3>
                        <div className={styles.detailGrid}>
                            <div className={styles.detailLabel}>단체</div>
                            <div className={styles.detailValue}>{detailBooking.organizationName}</div>
                            <div className={styles.detailLabel}>신청자</div>
                            <div className={styles.detailValue}>{detailBooking.applicantName} ({detailBooking.phone})</div>
                            <div className={styles.detailLabel}>공간</div>
                            <div className={styles.detailValue}>{detailBooking.roomName}</div>
                            <div className={styles.detailLabel}>사용일시</div>
                            <div className={styles.detailValue}>{formatDateTime(detailBooking.startDateTime)} ~ {formatDateTime(detailBooking.endDateTime)}</div>
                            <div className={styles.detailLabel}>목적</div>
                            <div className={styles.detailValue}>{detailBooking.purpose || "-"}</div>
                            <div className={styles.detailLabel}>비고</div>
                            <div className={styles.detailValue}>{detailBooking.memo || "-"}</div>
                            <div className={styles.detailLabel}>상태</div>
                            <div className={styles.detailValue}><StatusBadge status={detailBooking.status} /></div>
                            <div className={styles.detailLabel}>신청일</div>
                            <div className={styles.detailValue}>{formatDateTime(detailBooking.submittedAt)}</div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.secondaryButton} onClick={() => setDetailBooking(null)}>닫기</button>
                            {detailBooking.status !== "approved" && (
                                <button className={styles.primaryButton} onClick={() => { approve(detailBooking.id); setDetailBooking(null); }}>승인</button>
                            )}
                            {detailBooking.status !== "rejected" && (
                                <button className={styles.warningButton} onClick={() => { setRejectBooking(detailBooking); setDetailBooking(null); }}>반려</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {rejectBooking && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>반려 사유 입력 · #{rejectBooking.id}</h3>
                        <div className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="rejectReason">반려 사유</label>
                                <textarea
                                    id="rejectReason"
                                    className={styles.textarea}
                                    placeholder="예: 시간대 중복으로 반려합니다."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.secondaryButton} onClick={() => { setRejectBooking(null); setRejectReason(""); }}>취소</button>
                            <button className={styles.warningButton} onClick={confirmReject} disabled={!rejectReason.trim()}>반려</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 