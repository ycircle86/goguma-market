'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state && 'redirectTo' in state) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-goguma-cream">
      {/* 헤더 */}
      <header className="bg-white border-b border-lime-100 sticky top-0 z-10">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-800 transition-colors">
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">내 좀비템 팔기 🧟</h1>
        </div>
      </header>

      {/* 폼 */}
      <main className="max-w-screen-md mx-auto px-4 py-6">
        <form action={action} className="space-y-5">

          {/* 사진 업로드 */}
          <div className="bg-white rounded-2xl border border-lime-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              사진 <span className="text-gray-400 font-normal text-xs">(선택 · 최대 5MB)</span>
            </label>

            {previewUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="업로드 미리보기"
                  className="w-full h-56 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-lime-200 rounded-xl cursor-pointer hover:bg-lime-50 transition-colors"
              >
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm text-gray-400">클릭해서 사진 추가</p>
                <p className="text-xs text-gray-300 mt-1">JPG · PNG · WEBP · GIF</p>
              </label>
            )}

            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* 제목 */}
          <div className="bg-white rounded-2xl border border-lime-100 p-5">
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
          <div className="bg-white rounded-2xl border border-lime-100 p-5">
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
          <div className="bg-white rounded-2xl border border-lime-100 p-5">
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
          <div className="bg-white rounded-2xl border border-lime-100 p-5">
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
