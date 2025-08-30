import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { access, refresh } = await request.json();

        if (!access) {
            return NextResponse.json(
                { error: 'Access token is required' },
                { status: 400 }
            );
        }

        // 토큰으로 사용자 정보 확인
        const response = await fetch('https://dev-api.kucisc.kr/api/account/me/', {
            headers: {
                'Authorization': `Bearer ${access}`,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userData = await response.json();

        // Admin 권한 체크 (role이 ADMIN인지 확인)
        if (userData.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        // 성공 응답과 함께 쿠키 설정
        const res = NextResponse.json({ success: true });

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
        console.error('Session creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// 세션 확인용 GET 메서드
export async function GET(request) {
    try {
        const sessionToken = request.cookies.get('admin_session')?.value;
        const role = request.cookies.get('admin_role')?.value;

        if (!sessionToken || role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'No valid session' },
                { status: 401 }
            );
        }

        // 토큰 유효성 재확인
        const response = await fetch('https://dev-api.kucisc.kr/api/account/me/', {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            // 토큰이 무효하면 쿠키 삭제
            const res = NextResponse.json(
                { error: 'Session expired' },
                { status: 401 }
            );
            res.cookies.delete('admin_session');
            res.cookies.delete('admin_role');
            return res;
        }

        const userData = await response.json();
        return NextResponse.json({
            valid: true,
            user: userData
        });

    } catch (error) {
        console.error('Session check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 