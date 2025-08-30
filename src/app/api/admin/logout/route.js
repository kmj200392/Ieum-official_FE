import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { refresh } = await request.json();

        // 리프레시 토큰이 있으면 서버에서 로그아웃 처리
        if (refresh) {
            try {
                await fetch('https://dev-api.kucisc.kr/api/account/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': 'application/json'
                    },
                    body: JSON.stringify({ refresh })
                });
            } catch (error) {
                console.error('Server logout error:', error);
                // 서버 로그아웃 실패해도 클라이언트 쿠키는 삭제
            }
        }

        // 성공 응답과 함께 쿠키 삭제
        const res = NextResponse.json({ success: true });

        // 쿠키 삭제
        res.cookies.delete('admin_session');
        res.cookies.delete('admin_role');

        return res;

    } catch (error) {
        console.error('Logout error:', error);

        // 에러가 발생해도 쿠키는 삭제
        const res = NextResponse.json({ success: true });
        res.cookies.delete('admin_session');
        res.cookies.delete('admin_role');

        return res;
    }
} 