import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // 외부 API로 로그인 시도
        const loginResponse = await fetch('https://dev-api.kucisc.kr/api/account/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!loginResponse.ok) {
            const errorData = await loginResponse.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData?.detail || 'Login failed' },
                { status: loginResponse.status }
            );
        }

        const tokens = await loginResponse.json();
        const { access, refresh } = tokens;

        if (!access) {
            return NextResponse.json(
                { error: 'Invalid login response' },
                { status: 500 }
            );
        }

        // 사용자 정보 확인
        const userResponse = await fetch('https://dev-api.kucisc.kr/api/account/me/', {
            headers: {
                'Authorization': `Bearer ${access}`,
                'accept': 'application/json'
            }
        });

        if (!userResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to get user info' },
                { status: 401 }
            );
        }

        const userData = await userResponse.json();

        // Admin 권한 체크
        if (userData.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        // 성공 응답과 함께 쿠키 설정
        const res = NextResponse.json({
            access,
            refresh,
            user: userData
        });

        // 쿠키 설정 (7일 유효)
        res.cookies.set('admin_session', access, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        res.cookies.set('admin_role', 'ADMIN', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return res;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 