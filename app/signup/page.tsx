'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signup } from '@/app/actions'

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, undefined)
  const router = useRouter()

  useEffect(() => {
    if (state && 'redirectTo' in state) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* 로고 */}
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🧟</div>
        <h1 className="text-2xl font-bold text-gray-800">고구마 마켓</h1>
        <p className="text-sm text-gray-500 mt-1">동네 좀비와 함께하는 으스스 귀여운 거래</p>
      </div>

      {/* 카드 */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-lime-100 p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6">회원가입</h2>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              닉네임
            </label>
            <input
              type="text"
              name="nickname"
              placeholder="동네 좀비들에게 보일 이름"
              required
              minLength={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              이메일
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              placeholder="6자 이상 입력하세요"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
            />
          </div>

          {/* 서버 액션 에러 메시지 */}
          {state && 'error' in state && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-goguma hover:bg-goguma-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? '가입 중...' : '가입하기'}
          </button>
        </form>
      </div>

      {/* 로그인 링크 */}
      <p className="mt-5 text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-goguma font-semibold hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
