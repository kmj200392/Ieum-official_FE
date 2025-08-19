const API_BASE = "https://dev-api.kucisc.kr/api";

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const access = body?.access;
        const refresh = body?.refresh;
        if (typeof access !== "string") {
            return new Response(JSON.stringify({ ok: false, message: "access token required" }), { status: 400 });
        }

        // 토큰 유효성 확인 - 더 기본적인 엔드포인트 사용
        const verifyRes = await fetch(`${API_BASE}/account/token/verify/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({ token: access }),
        });

        if (!verifyRes.ok) {
            return new Response(JSON.stringify({ ok: false, message: "invalid token" }), { status: 401 });
        }

        const oneHour = 60 * 60;
        const headers = new Headers();
        headers.append(
            "Set-Cookie",
            `user_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${oneHour}; Secure`
        );
        headers.append(
            "Set-Cookie",
            `user_access=${encodeURIComponent(access)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${oneHour}; Secure`
        );
        headers.append(
            "Set-Cookie",
            `user_role=USER; Path=/; SameSite=Lax; Max-Age=${oneHour}; Secure`
        );

        return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }
} 