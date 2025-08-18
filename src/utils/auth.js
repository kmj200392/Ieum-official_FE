export const API_BASE = "https://dev-api.kucisc.kr/api";
export const LOGIN_ENDPOINT = `${API_BASE}/account/login/`;
export const REFRESH_ENDPOINT = `${API_BASE}/account/token/refresh/`;

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
let refreshTimerId = null;

export function getAccessToken() {
    try {
        return localStorage.getItem(ACCESS_KEY) || "";
    } catch {
        return "";
    }
}

export function getRefreshToken() {
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

export function clearTokens() {
    try {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    } catch { }
    if (refreshTimerId) {
        clearTimeout(refreshTimerId);
        refreshTimerId = null;
    }
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
    setTokens(newAccess, refresh);
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