export const API_BASE = "https://dev-api.kucisc.kr/api";
export const LOGIN_ENDPOINT = `${API_BASE}/account/login/`;
export const REFRESH_ENDPOINT = `${API_BASE}/account/token/refresh/`;

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
// Locker access token은 메모리 변수에만 저장 (새로고침 시 초기화)
let lockerAccessToken = "";
let refreshTimerId = null;

// 메모리 변수로 토큰과 사용자 정보 저장 (새로고침 시 초기화)
let memoryAccessToken = "";
let memoryRefreshToken = "";
let memoryOrganizationName = "";

export function getAccessToken() {
    // 메모리 변수를 우선으로 사용
    if (memoryAccessToken) return memoryAccessToken;

    try {
        return localStorage.getItem(ACCESS_KEY) || "";
    } catch {
        return "";
    }
}

export function getRefreshToken() {
    // 메모리 변수를 우선으로 사용
    if (memoryRefreshToken) return memoryRefreshToken;

    try {
        return localStorage.getItem(REFRESH_KEY) || "";
    } catch {
        return "";
    }
}

export function setTokens(access, refresh) {
    try {
        if (typeof access === "string") localStorage.setItem(ACCESS_KEY, access);
        if (typeof refresh === "string") localStorage.setItem(REFRESH_KEY, refresh);
    } catch { }
}

// 메모리에 토큰 저장 (새로고침 시 초기화)
export function setMemoryTokens(access, refresh) {
    memoryAccessToken = typeof access === "string" ? access : "";
    memoryRefreshToken = typeof refresh === "string" ? refresh : "";
}

// 단체명 관리
export function setOrganizationName(name) {
    memoryOrganizationName = typeof name === "string" ? name : "";
}

export function getOrganizationName() {
    return memoryOrganizationName;
}

export function clearTokens() {
    try {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    } catch { }

    // 메모리 변수들도 정리
    memoryAccessToken = "";
    memoryRefreshToken = "";
    memoryOrganizationName = "";

    if (refreshTimerId) {
        clearTimeout(refreshTimerId);
        refreshTimerId = null;
    }
}

// Locker API 전용 토큰 관리 (메모리 저장)
export function setLockerAccessToken(token) {
    lockerAccessToken = typeof token === "string" ? token : "";
}

export function getLockerAccessToken() {
    return lockerAccessToken || "";
}

export function clearLockerAccessToken() {
    lockerAccessToken = "";
}

function decodeJwtExp(token) {
    try {
        const payload = token.split(".")[1];
        const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        return typeof json.exp === "number" ? json.exp : null;
    } catch {
        return null;
    }
}

export async function refreshAccessToken() {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token");

    const res = await fetch(REFRESH_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            // 일부 백엔드는 Authorization 헤더에 기존 access 토큰을 요구
            Authorization: access ? `Bearer ${access}` : undefined,
        },
        body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to refresh token");
    }

    const data = await res.json().catch(() => ({}));
    const newAccess = data?.access;
    if (typeof newAccess !== "string") throw new Error("Invalid refresh response");

    // 메모리 변수도 업데이트
    setMemoryTokens(newAccess, refresh);
    scheduleAccessTokenRefresh(newAccess, refresh);
    return newAccess;
}

export function scheduleAccessTokenRefresh(access = getAccessToken(), refresh = getRefreshToken()) {
    if (!access || !refresh) return;
    const exp = decodeJwtExp(access);
    if (!exp) return;
    const nowSec = Math.floor(Date.now() / 1000);
    // 만료 60초 전에 갱신 시도
    const delayMs = Math.max((exp - 60 - nowSec) * 1000, 0);
    if (refreshTimerId) clearTimeout(refreshTimerId);
    refreshTimerId = setTimeout(() => {
        refreshAccessToken().catch(() => {
            // 자동 갱신 실패 시 토큰 정리
            clearTokens();
        });
    }, delayMs);
}

export async function authorizedFetch(input, init = {}) {
    const access = getAccessToken();
    const headers = new Headers(init.headers || {});
    if (access) headers.set("Authorization", `Bearer ${access}`);
    let response = await fetch(input, { ...init, headers });

    if (response.status === 401 || response.status === 400) {
        // 토큰 재발급 시도
        try {
            const newAccess = await refreshAccessToken();
            const retryHeaders = new Headers(init.headers || {});
            retryHeaders.set("Authorization", `Bearer ${newAccess}`);
            response = await fetch(input, { ...init, headers: retryHeaders });
        } catch {
            return response; // 실패 시 원 응답 반환
        }
    }
    return response;
}

// 일반 사용자 로그아웃
export async function userLogout() {
    const refresh = getRefreshToken();
    try {
        await fetch("/api/user/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });
    } catch { }
    clearTokens();
}

// 관리자 토큰 갱신
export async function refreshAdminToken() {
    const access = localStorage.getItem('adminToken') || getAccessToken();
    const refresh = getRefreshToken();
    if (!refresh) throw new Error("No refresh token");

    const res = await fetch(REFRESH_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: access ? `Bearer ${access}` : undefined,
        },
        body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to refresh admin token");
    }

    const data = await res.json().catch(() => ({}));
    const newAccess = data?.access;
    if (typeof newAccess !== "string") throw new Error("Invalid refresh response");

    // 일반 토큰과 admin 토큰 모두 업데이트
    setMemoryTokens(newAccess, refresh);
    localStorage.setItem('adminToken', newAccess);
    scheduleAccessTokenRefresh(newAccess, refresh);

    // 관리자 세션 쿠키도 업데이트
    try {
        await fetch("/api/admin/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access: newAccess, refresh }),
        });
    } catch (error) {
        console.warn("Failed to update admin session:", error);
    }

    return newAccess;
}

// 관리자 전용 authorizedFetch (adminToken 사용)
export async function authorizedAdminFetch(input, init = {}) {
    const access = localStorage.getItem('adminToken') || getAccessToken();
    const headers = new Headers(init.headers || {});
    if (access) headers.set("Authorization", `Bearer ${access}`);
    let response = await fetch(input, { ...init, headers });

    if (response.status === 401) {
        // 토큰 재발급 시도
        try {
            const newAccess = await refreshAdminToken();
            const retryHeaders = new Headers(init.headers || {});
            retryHeaders.set("Authorization", `Bearer ${newAccess}`);
            response = await fetch(input, { ...init, headers: retryHeaders });
        } catch (error) {
            console.error("Admin token refresh failed:", error);
            // 갱신 실패 시 로그아웃 처리
            clearTokens();
            localStorage.removeItem('adminToken');
            window.location.href = '/admin';
            return response;
        }
    }
    return response;
}

// 관리자 로그아웃
export async function adminLogout() {
    const refresh = getRefreshToken();
    try {
        await fetch("/api/admin/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });
    } catch { }
    clearTokens();
    localStorage.removeItem('adminToken');
} 