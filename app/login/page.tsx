'use client'

import { Suspense, useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { login } from '@/app/actions'

function LoginForm() {
  const [state, action, isPending] = useActionState(login, undefined)
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get('message')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (state && 'redirectTo' in state) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-lime-100 p-8">
      <h2 className="text-lg font-bold text-gray-800 mb-6">로그인</h2>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          {message}
        </div>
      )}
      {errorParam && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {errorParam}
        </div>
      )}

      <form action={action} className="space-y-4">
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
            placeholder="비밀번호를 입력하세요"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
          />
        </div>

        {state && 'error' in state && (
          <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-goguma hover:bg-goguma-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-3">🧟</div>
        <h1 className="text-2xl font-bold text-gray-800">고구마 마켓</h1>
        <p className="text-sm text-gray-500 mt-1">동네 좀비와 함께하는 으스스 귀여운 거래</p>
      </div>

      <Suspense fallback={<div className="w-full max-w-sm h-64 bg-white rounded-2xl shadow-sm border border-lime-100" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-5 text-sm text-gray-500">
        아직 계정이 없으신가요?{' '}
        <Link href="/signup" className="text-goguma font-semibold hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}
