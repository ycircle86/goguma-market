'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
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
  image_url: string | null
}

type Props = {
  product: Product
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function EditForm({ product, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, undefined)
  const router = useRouter()
  const [previewUrl, setPreviewUrl] = useState<string | null>(product.image_url)
  const [removeImage, setRemoveImage] = useState(false)
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
      setRemoveImage(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setRemoveImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-goguma-cream">
      <header className="bg-white border-b border-lime-100 sticky top-0 z-10">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/products/${product.id}`} className="text-gray-500 hover:text-gray-800 transition-colors">
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">판매글 수정</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        <form action={formAction} className="space-y-5">

          {/* 숨김 필드: 기존 이미지 URL과 삭제 여부 전달 */}
          <input type="hidden" name="existing_image_url" value={product.image_url ?? ''} />
          <input type="hidden" name="remove_image" value={removeImage ? 'true' : 'false'} />

          {/* 사진 관리 */}
          <div className="bg-white rounded-2xl border border-lime-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              사진 <span className="text-gray-400 font-normal text-xs">(선택 · 최대 5MB)</span>
            </label>

            {previewUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="상품 이미지"
                  className="w-full h-56 object-cover rounded-xl"
                />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <label
                    htmlFor="image-upload"
                    className="px-3 py-1 bg-black/50 hover:bg-black/70 text-white text-xs rounded-full cursor-pointer transition-colors"
                  >
                    변경
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1 bg-black/50 hover:bg-black/70 text-white text-xs rounded-full transition-colors"
                  >
                    삭제
                  </button>
                </div>
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

          <div className="bg-white rounded-2xl border border-lime-100 p-5">
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

          <div className="bg-white rounded-2xl border border-lime-100 p-5">
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

          <div className="bg-white rounded-2xl border border-lime-100 p-5">
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

          <div className="bg-white rounded-2xl border border-lime-100 p-5">
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
