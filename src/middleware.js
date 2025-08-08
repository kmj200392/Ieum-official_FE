import { NextResponse } from "next/server";

// 보호할 경로 prefix
const ADMIN_PREFIX = "/admin";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // /admin 루트는 로그인 페이지이므로, 세션 있으면 accounts로 보내고, 없으면 그대로 허용
    if (pathname === "/admin") {
        const hasSession = request.cookies.get("admin_session")?.value;
        if (hasSession) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin/accounts";
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // /admin 하위 경로 보호
    if (pathname.startsWith(ADMIN_PREFIX + "/")) {
        const hasSession = request.cookies.get("admin_session")?.value;
        if (!hasSession) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin",
        "/admin/:path*",
    ],
}; 