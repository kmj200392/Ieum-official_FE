export async function POST() {
    const headers = new Headers();
    headers.append(
        "Set-Cookie",
        `admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
    );
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
} 