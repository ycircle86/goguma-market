'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ActionState } from '@/app/actions'

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

type Product = {
  id: string
  title: string
  price: number
  description: string
  category: string
}

type Props = {
  product: Product
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function EditForm({ product, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined)
  const router = useRouter()

  useEffect(() => {
    if (state && 'redirectTo' in state) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/products/${product.id}`} className="text-gray-500 hover:text-gray-800 transition-colors">
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">판매글 수정</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        <form action={formAction} className="space-y-5">

          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              제목 <span className="text-goguma">*</span>
            </label>
            <input
              type="text"
              name="title"
              defaultValue={product.title}
              required
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
            />
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              카테고리 <span className="text-goguma">*</span>
            </label>
            <select
              name="category"
              required
              defaultValue={product.category}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors bg-white"
            >
              <option value="" disabled>카테고리를 선택하세요</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              가격 <span className="text-goguma">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="price"
                defaultValue={product.price}
                required
                min={0}
                className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              설명 <span className="text-goguma">*</span>
            </label>
            <textarea
              name="description"
              defaultValue={product.description}
              required
              rows={6}
              maxLength={2000}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors resize-none"
            />
          </div>

          {state && 'error' in state && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 p-3 rounded-xl">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-goguma hover:bg-goguma-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? '저장 중...' : '수정 완료'}
          </button>
        </form>
      </main>
    </div>
  )
}
