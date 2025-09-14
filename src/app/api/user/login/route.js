export async function POST(request) {
    try {
        const { name, phone_number, student_id } = await request.json();

        if (!name || !phone_number || !student_id) {
            return new Response(JSON.stringify({ ok: false, message: "required fields: name, phone_number, student_id" }), { status: 400 });
        }

        const payload = {
            name,
            phone_number: String(phone_number).replace(/[^0-9]/g, ""),
            student_id,
        };

        const res = await fetch("https://locker-api.kucisc.kr/api/v1/auth/login-or-register", {
            method: "POST",
            headers: { "Content-Type": "application/json", accept: "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return new Response(JSON.stringify({ ok: false, message: data?.message || "login failed" }), { status: res.status });
        }

        // 성공 시 프론트가 필요로 할 토큰/세션 정보를 그대로 반환
        return new Response(JSON.stringify({ ok: true, data }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false, message: "bad request" }), { status: 400 });
    }
} 