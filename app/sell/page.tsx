'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createProduct } from '@/app/actions'

const CATEGORIES = [
  '디지털/가전',
  '의류/잡화',
  '가구/인테리어',
  '생활/주방',
  '스포츠/레저',
  '도서/음반',
  '유아/아동',
  '식물',
  '기타',
]

export default function SellPage() {
  const [state, action, isPending] = useActionState(createProduct, undefined)
  const router = useRouter()

  useEffect(() => {
    if (state && 'redirectTo' in state) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-800 transition-colors">
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">내 물건 팔기</h1>
        </div>
      </header>

      {/* 폼 */}
      <main className="max-w-screen-md mx-auto px-4 py-6">
        <form action={action} className="space-y-5">

          {/* 제목 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              제목 <span className="text-goguma">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="글 제목을 입력하세요"
              required
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
            />
          </div>

          {/* 카테고리 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              카테고리 <span className="text-goguma">*</span>
            </label>
            <select
              name="category"
              required
              defaultValue=""
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors bg-white"
            >
              <option value="" disabled>카테고리를 선택하세요</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 가격 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              가격 <span className="text-goguma">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="price"
                placeholder="0"
                required
                min={0}
                className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">무료 나눔이면 0원으로 입력하세요</p>
          </div>

          {/* 설명 */}
          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              설명 <span className="text-goguma">*</span>
            </label>
            <textarea
              name="description"
              placeholder="올릴 상품에 대해 설명해 주세요.&#10;(상태, 사용기간, 하자 유무 등)"
              required
              rows={6}
              maxLength={2000}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors resize-none"
            />
          </div>

          {/* 에러 메시지 */}
          {state && 'error' in state && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl">
              {state.error}
            </p>
          )}

          {/* 등록 버튼 */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-goguma hover:bg-goguma-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? '등록 중...' : '완료'}
          </button>
        </form>
      </main>
    </div>
  )
}
