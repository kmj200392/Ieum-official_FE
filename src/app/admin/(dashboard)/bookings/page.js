"use client";

import { useMemo, useState, useEffect } from "react";
import styles from "./page.module.css";
import { authorizedAdminFetch } from "@/utils/auth";

// API 호출 함수 - 자동 토큰 갱신 지원
async function fetchBookings() {
    try {
        const response = await authorizedAdminFetch('https://dev-api.kucisc.kr/api/room/admin/', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}

// 샘플 데이터 (API 응답 구조에 맞춤)
const initialBookings = [
    {
        id: 1,
        organization_name: "정보대학 학생회",
        purpose: "정기 세미나",
        contact_email: "student@korea.ac.kr",
        start_time: "2025-08-20T10:00:00+09:00",
        end_time: "2025-08-20T12:00:00+09:00",
        status: "PENDING",
        owner: {
            id: 1,
            organization_name: "정보대학 학생회"
        },
        created_by: {
            id: 1,
            organization_name: "정보대학 학생회"
        },
        admin_response_at: null,
        created_at: "2025-08-19T15:33:19.971931+09:00",
        deleted_at: null,
        deleted_reason: ""
    },
    {
        id: 2,
        organization_name: "정보대학 운영팀",
        purpose: "행사 준비회의",
        contact_email: "team@korea.ac.kr",
        start_time: "2025-08-21T14:00:00+09:00",
        end_time: "2025-08-21T16:00:00+09:00",
        status: "APPROVED",
        owner: {
            id: 2,
            organization_name: "정보대학 운영팀"
        },
        created_by: {
            id: 2,
            organization_name: "정보대학 운영팀"
        },
        admin_response_at: "2025-08-19T16:00:00+09:00",
        created_at: "2025-08-19T14:33:19.971931+09:00",
        deleted_at: null,
        deleted_reason: ""
    },
    {
        id: 3,
        organization_name: "정보대학 동아리연합",
        purpose: "번개 모임",
        contact_email: "club@korea.ac.kr",
        start_time: "2025-08-18T19:00:00+09:00",
        end_time: "2025-08-18T21:00:00+09:00",
        status: "REJECTED",
        owner: {
            id: 3,
            organization_name: "정보대학 동아리연합"
        },
        created_by: {
            id: 3,
            organization_name: "정보대학 동아리연합"
        },
        admin_response_at: "2025-08-19T10:00:00+09:00",
        created_at: "2025-08-18T15:33:19.971931+09:00",
        deleted_at: null,
        deleted_reason: "시간대 중복"
    }
];

// ISO 문자열을 포맷팅하는 함수
function formatDateTime(isoString) {
    try {
        if (!isoString) return "-";
        const d = new Date(isoString);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch {
        return "-";
    }
}

// 상태 Badge 컴포넌트 (API 상태값에 맞춤)
function StatusBadge({ status }) {
    const className =
        status === "APPROVED" ? styles.badgeApproved :
            status === "REJECTED" ? styles.badgeRejected :
                styles.badgePending;
    const label =
        status === "APPROVED" ? "승인" :
            status === "REJECTED" ? "반려" :
                "대기";
    return <span className={`${styles.badge} ${className}`}>{label}</span>;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState(initialBookings);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all | PENDING | APPROVED | REJECTED
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [detailBooking, setDetailBooking] = useState(null);
    const [rejectBooking, setRejectBooking] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const data = await fetchBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        return bookings
            .filter((b) => {
                if (statusFilter !== "all" && b.status !== statusFilter) return false;
                if (keyword) {
                    const hay = `${b.id} ${b.organization_name} ${b.purpose} ${b.contact_email}`.toLowerCase();
                    if (!hay.includes(keyword.toLowerCase())) return false;
                }
                if (dateFrom) {
                    const fromMs = new Date(dateFrom).setHours(0, 0, 0, 0);
                    const startMs = new Date(b.start_time).getTime();
                    if (startMs < fromMs) return false;
                }
                if (dateTo) {
                    const toMs = new Date(dateTo).setHours(23, 59, 59, 999);
                    const startMs = new Date(b.start_time).getTime();
                    if (startMs > toMs) return false;
                }
                return true;
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [bookings, keyword, statusFilter, dateFrom, dateTo]);

    const approve = async (targetId) => {
        try {
            const response = await authorizedAdminFetch(`https://dev-api.kucisc.kr/api/room/admin/${targetId}/approve/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to approve booking');
            }

            // 성공 시 로컬 상태 업데이트
            setBookings((prev) => prev.map((b) =>
                b.id === targetId ? {
                    ...b,
                    status: "APPROVED",
                    admin_response_at: new Date().toISOString()
                } : b
            ));

            alert('예약이 승인되었습니다.');
            loadBookings(); // 데이터 새로고침
        } catch (error) {
            console.error('Failed to approve booking:', error);
            alert('예약 승인 중 오류가 발생했습니다.');
        }
    };

    const openReject = (booking) => {
        setRejectBooking(booking);
        setRejectReason("");
    };

    const confirmReject = async () => {
        if (!rejectBooking) return;
        try {
            const response = await authorizedAdminFetch(`https://dev-api.kucisc.kr/api/room/admin/${rejectBooking.id}/reject/`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to reject booking');
            }

            // 성공 시 로컬 상태 업데이트
            setBookings((prev) =>
                prev.map((b) => (b.id === rejectBooking.id ? {
                    ...b,
                    status: "REJECTED",
                    deleted_reason: rejectReason,
                    admin_response_at: new Date().toISOString()
                } : b))
            );
            setRejectBooking(null);
            setRejectReason("");

            alert('예약이 반려되었습니다.');
            loadBookings(); // 데이터 새로고침
        } catch (error) {
            console.error('Failed to reject booking:', error);
            alert('예약 반려 중 오류가 발생했습니다.');
        }
    };

    const removeBooking = async (targetId) => {
        if (!confirm('정말로 이 예약을 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await authorizedAdminFetch(`https://dev-api.kucisc.kr/api/room/admin/${targetId}/`, {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete booking');
            }

            // 성공 시 로컬 상태 업데이트
            setBookings((prev) => prev.filter((b) => b.id !== targetId));
            alert('예약이 삭제되었습니다.');
        } catch (error) {
            console.error('Failed to remove booking:', error);
            alert('예약 삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <h2 className={styles.title}>학생회실 대관</h2>
                <div className={styles.headerActions}>
                    <input
                        className={styles.searchInput}
                        placeholder="검색: 예약번호/단체명/목적/이메일"
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
                        <option value="PENDING">대기</option>
                        <option value="APPROVED">승인</option>
                        <option value="REJECTED">반려</option>
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
                    <button
                        className={styles.secondaryButton}
                        onClick={loadBookings}
                        disabled={loading}
                    >
                        {loading ? "로딩..." : "새로고침"}
                    </button>
                </div>
            </div>

            <div className={styles.table}>
                <div className={`${styles.row} ${styles.header}`}>
                    <div>예약번호</div>
                    <div>단체명</div>
                    <div>목적</div>
                    <div>연락처</div>
                    <div>사용일시</div>
                    <div>상태</div>
                    <div>신청일</div>
                    <div>액션</div>
                </div>
                {filtered.map((b) => (
                    <div key={b.id} className={styles.row}>
                        <div>#{b.id}</div>
                        <div>
                            <div className={styles.bold}>{b.organization_name}</div>
                            <div className={styles.sub}>{b.created_by?.organization_name || b.owner?.organization_name}</div>
                        </div>
                        <div>{b.purpose}</div>
                        <div>{b.contact_email}</div>
                        <div>
                            <div>{formatDateTime(b.start_time)}</div>
                            <div className={styles.sub}>~ {formatDateTime(b.end_time)}</div>
                        </div>
                        <div><StatusBadge status={b.status} /></div>
                        <div>{formatDateTime(b.created_at)}</div>
                        <div className={styles.actions}>
                            <button className={styles.secondaryButton} onClick={() => setDetailBooking(b)}>상세</button>
                            {b.status === "PENDING" && (
                                <>
                                    <button className={styles.primaryButton} onClick={() => approve(b.id)}>승인</button>
                                    <button className={styles.warningButton} onClick={() => openReject(b)}>반려</button>
                                </>
                            )}
                            <button className={styles.dangerButton} onClick={() => removeBooking(b.id)}>삭제</button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className={styles.empty}>
                        {loading ? "데이터를 불러오는 중..." : "조건에 맞는 대관 신청이 없습니다."}
                    </div>
                )}
            </div>

            {detailBooking && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>신청 상세 #{detailBooking.id}</h3>
                        <div className={styles.detailGrid}>
                            <div className={styles.detailLabel}>단체명</div>
                            <div className={styles.detailValue}>{detailBooking.organization_name}</div>
                            <div className={styles.detailLabel}>신청자</div>
                            <div className={styles.detailValue}>{detailBooking.created_by?.organization_name || detailBooking.owner?.organization_name}</div>
                            <div className={styles.detailLabel}>연락처</div>
                            <div className={styles.detailValue}>{detailBooking.contact_email}</div>
                            <div className={styles.detailLabel}>사용일시</div>
                            <div className={styles.detailValue}>{formatDateTime(detailBooking.start_time)} ~ {formatDateTime(detailBooking.end_time)}</div>
                            <div className={styles.detailLabel}>목적</div>
                            <div className={styles.detailValue}>{detailBooking.purpose || "-"}</div>
                            <div className={styles.detailLabel}>상태</div>
                            <div className={styles.detailValue}><StatusBadge status={detailBooking.status} /></div>
                            <div className={styles.detailLabel}>신청일</div>
                            <div className={styles.detailValue}>{formatDateTime(detailBooking.created_at)}</div>
                            {detailBooking.admin_response_at && (
                                <>
                                    <div className={styles.detailLabel}>처리일</div>
                                    <div className={styles.detailValue}>{formatDateTime(detailBooking.admin_response_at)}</div>
                                </>
                            )}
                            {detailBooking.deleted_reason && (
                                <>
                                    <div className={styles.detailLabel}>반려사유</div>
                                    <div className={styles.detailValue}>{detailBooking.deleted_reason}</div>
                                </>
                            )}
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.secondaryButton} onClick={() => setDetailBooking(null)}>닫기</button>
                            {detailBooking.status === "PENDING" && (
                                <>
                                    <button className={styles.primaryButton} onClick={() => { approve(detailBooking.id); setDetailBooking(null); }}>승인</button>
                                    <button className={styles.warningButton} onClick={() => { setRejectBooking(detailBooking); setDetailBooking(null); }}>반려</button>
                                </>
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