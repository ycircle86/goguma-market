import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteProduct } from '@/app/actions'
import DeleteButton from './DeleteButton'

function formatPrice(price: number): string {
  if (price === 0) return '무료 나눔'
  return price.toLocaleString('ko-KR') + '원'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: { user } }, { data: product }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('products')
      .select('*, profiles(nickname)')
      .eq('id', id)
      .single(),
  ])

  if (!product) notFound()

  const isOwner = user?.id === product.seller_id
  const isSelling = product.status === 'selling'
  const boundDelete = deleteProduct.bind(null, id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-800 transition-colors text-lg leading-none">
              ←
            </Link>
            <h1 className="font-bold text-gray-800">상품 정보</h1>
          </div>

          {/* 소유자만 수정/삭제 버튼 표시 */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/products/${id}/edit`}
                className="px-4 py-2 text-sm font-medium text-goguma border border-goguma rounded-xl hover:bg-orange-50 transition-colors"
              >
                수정
              </Link>
              <DeleteButton action={boundDelete} />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-5 space-y-3">
        {/* 이미지 자리 */}
        <div className="bg-white rounded-2xl border border-orange-100 h-64 flex items-center justify-center">
          <div className="text-center text-gray-300">
            <div className="text-6xl mb-2">📦</div>
            <p className="text-sm">사진 없음</p>
          </div>
        </div>

        {/* 판매자 정보 */}
        <div className="bg-white rounded-2xl border border-orange-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">
            🍠
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800">
              {product.profiles?.nickname ?? '알 수 없음'}
            </p>
            <p className="text-xs text-gray-400">판매자</p>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="bg-white rounded-2xl border border-orange-100 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-800 flex-1 leading-snug">
              {product.title}
            </h2>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                isSelling
                  ? 'bg-orange-100 text-goguma'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isSelling ? '판매중' : '판매완료'}
            </span>
          </div>

          <p className="text-xs text-gray-400">
            {product.category} · {formatDate(product.created_at)}
          </p>

          <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>

          <hr className="border-gray-100" />

          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {product.description}
          </p>
        </div>
      </main>
    </div>
  )
}
