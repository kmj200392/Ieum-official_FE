const API_BASE = "https://dev-api.kucisc.kr/api";

export async function POST(request) {
	try {
		const body = await request.json().catch(() => ({}));
		const access = body?.access;
		const refresh = body?.refresh;
		if (typeof access !== "string") {
			return new Response(JSON.stringify({ ok: false, message: "access token required" }), { status: 400 });
		}

		// Verify the user has admin privileges by hitting a protected admin-only endpoint
		const verifyRes = await fetch(`${API_BASE}/account/users/`, {
			method: "GET",
			headers: {
				accept: "application/json",
				Authorization: `Bearer ${access}`,
			},
		});

		if (!verifyRes.ok) {
			return new Response(JSON.stringify({ ok: false, message: "not admin" }), { status: 403 });
		}

		const oneHour = 60 * 60;
		const headers = new Headers();
		headers.append(
			"Set-Cookie",
			`admin_session=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=${oneHour}; Secure`
		);
		headers.append(
			"Set-Cookie",
			`admin_access=${encodeURIComponent(access)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${oneHour}; Secure`
		);
		headers.append(
			"Set-Cookie",
			`admin_role=ADMIN; Path=/; SameSite=Lax; Max-Age=${oneHour}; Secure`
		);

		return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
	} catch (e) {
		return new Response(JSON.stringify({ ok: false }), { status: 400 });
	}
} 