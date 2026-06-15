import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 로그인 없이 접근 가능한 경로
const publicPaths = ['/login', '/signup', '/auth/callback']

export default async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req })

  // Supabase 세션 토큰 갱신을 위해 쿠키를 읽고 씀
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser()는 Supabase 서버에서 JWT를 검증 (getSession()보다 안전)
  const { data: { user } } = await supabase.auth.getUser()

  const path = req.nextUrl.pathname
  const isPublicPath = publicPaths.some((p) => path.startsWith(p))

  // 로그인 상태에서 로그인/회원가입 페이지 접근 → 홈으로
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  // 비로그인 상태에서 보호된 경로 접근 → 로그인 페이지로
  if (!user && !isPublicPath && path !== '/') {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
