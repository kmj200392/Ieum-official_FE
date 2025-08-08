export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body || {};

        // 임시 인증 로직: admin/admin
        const isValid = username === "admin" && password === "admin";
        if (!isValid) {
            return new Response(JSON.stringify({ ok: false, message: "invalid" }), { status: 401 });
        }

        const oneHour = 60 * 60;
        const headers = new Headers();
        headers.append(
            "Set-Cookie",
            `admin_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${oneHour}; Secure`
        );

        return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }
} 