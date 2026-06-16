import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteProduct } from '@/app/actions'
import DeleteButton from './DeleteButton'
import LikeButton from './LikeButton'
import CommentForm from './CommentForm'
import CommentDeleteButton from './CommentDeleteButton'

type CommentRow = {
  id: string
  content: string
  user_id: string
  created_at: string
  profiles: { nickname: string } | { nickname: string }[] | null
}

function getNickname(profiles: CommentRow['profiles']): string {
  if (!profiles) return '알 수 없음'
  return Array.isArray(profiles) ? (profiles[0]?.nickname ?? '알 수 없음') : profiles.nickname
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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

  const [{ data: { user } }, { data: product }, { data: comments }, { data: likes }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('products')
      .select('*, profiles(nickname, avatar_url)')
      .eq('id', id)
      .single(),
    supabase
      .from('comments')
      .select('id, content, user_id, created_at, profiles(nickname)')
      .eq('product_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('likes')
      .select('user_id')
      .eq('product_id', id),
  ])

  if (!product) notFound()

  const isOwner = user?.id === product.seller_id
  const isSelling = product.status === 'selling'
  const boundDelete = deleteProduct.bind(null, id)

  const commentList = (comments ?? []) as CommentRow[]
  const likeList = likes ?? []
  const likeCount = likeList.length
  const isLiked = !!user && likeList.some((like) => like.user_id === user.id)

  return (
    <div className="min-h-screen bg-goguma-cream">
      {/* 헤더 */}
      <header className="bg-white border-b border-lime-100 sticky top-0 z-10">
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
                className="px-4 py-2 text-sm font-medium text-goguma border border-goguma rounded-xl hover:bg-lime-50 transition-colors"
              >
                수정
              </Link>
              <DeleteButton action={boundDelete} />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-5 space-y-3">
        {/* 상품 이미지 */}
        <div className="bg-white rounded-2xl border border-lime-100 overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-72 object-cover"
            />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-300">
                <div className="text-6xl mb-2"><span className="animate-swagger">🧟</span></div>
                <p className="text-sm">사진 없음</p>
              </div>
            </div>
          )}
        </div>

        {/* 판매자 정보 (클릭 시 프로필로 이동) */}
        <Link
          href={`/users/${product.seller_id}`}
          className="bg-white rounded-2xl border border-lime-100 p-4 flex items-center gap-3 hover:bg-lime-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
            {product.profiles?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.profiles.avatar_url}
                alt={product.profiles?.nickname ?? '판매자'}
                className="w-full h-full object-cover"
              />
            ) : (
              '🧟'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-800 truncate">
              {product.profiles?.nickname ?? '알 수 없음'}
            </p>
            <p className="text-xs text-gray-400">판매자 · 프로필 보기 →</p>
          </div>
        </Link>

        {/* 상품 정보 */}
        <div className="bg-white rounded-2xl border border-lime-100 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-800 flex-1 leading-snug">
              {product.title}
            </h2>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                isSelling
                  ? 'bg-lime-100 text-goguma'
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

          <hr className="border-gray-100" />

          {/* 좋아요 버튼 */}
          <LikeButton productId={id} initialLiked={isLiked} initialCount={likeCount} />
        </div>

        {/* 댓글 영역 */}
        <div className="bg-white rounded-2xl border border-lime-100 p-5 space-y-4">
          <h3 className="font-bold text-gray-800">
            댓글 <span className="text-goguma">{commentList.length}</span>
          </h3>

          {/* 댓글 작성 폼 (로그인한 사용자만) */}
          {user ? (
            <CommentForm productId={id} />
          ) : (
            <p className="text-sm text-gray-400">
              댓글을 작성하려면{' '}
              <Link href="/login" className="text-goguma font-semibold hover:underline">
                로그인
              </Link>
              이 필요해요.
            </p>
          )}

          {/* 댓글 목록 */}
          {commentList.length > 0 ? (
            <ul className="space-y-4 pt-1">
              {commentList.map((comment) => (
                <li key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-lime-100 flex items-center justify-center text-sm flex-shrink-0">
                    🍠
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="font-semibold text-sm text-gray-800 truncate">
                          {getNickname(comment.profiles)}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatDateTime(comment.created_at)}
                        </span>
                      </div>
                      {user?.id === comment.user_id && (
                        <CommentDeleteButton commentId={comment.id} productId={id} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              아직 댓글이 없어요. 첫 좀비가 되어 댓글을 남겨보세요! 🧟
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
