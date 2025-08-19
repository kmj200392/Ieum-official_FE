export async function POST(request) {
    // Try to read refresh token from body (optional)
    let refresh = undefined;
    try {
        const json = await request.json();
        refresh = json?.refresh;
    } catch { }

    // Access token from HttpOnly cookie (set during user session creation)
    const access = request.cookies.get("user_access")?.value;

    // Call upstream logout API if we have tokens
    try {
        if (access || refresh) {
            await fetch("https://dev-api.kucisc.kr/api/account/logout/", {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    ...(access ? { Authorization: `Bearer ${access}` } : {}),
                },
                body: JSON.stringify({ refresh }),
            });
        }
    } catch { }

    const headers = new Headers();
    headers.append(
        "Set-Cookie",
        `user_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
    );
    headers.append(
        "Set-Cookie",
        `user_role=; Path=/; SameSite=Lax; Max-Age=0; Secure`
    );
    headers.append(
        "Set-Cookie",
        `user_access=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
    );
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
} 