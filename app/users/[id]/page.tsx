import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

function formatPrice(price: number): string {
  if (price === 0) return '무료 나눔'
  return price.toLocaleString('ko-KR') + '원'
}

function formatTimeAgo(dateStr: string): string {
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diffMin < 1) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}일 전`
  return `${Math.floor(diffDay / 30)}달 전`
}

type Product = {
  id: string
  title: string
  price: number
  category: string
  status: string
  created_at: string
  image_url: string | null
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: { user } }, { data: profile }, { data: products }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('profiles')
      .select('id, nickname, bio, avatar_url')
      .eq('id', id)
      .single(),
    supabase
      .from('products')
      .select('id, title, price, category, status, created_at, image_url')
      .eq('seller_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!profile) notFound()

  const isMe = user?.id === profile.id
  const productList = (products ?? []) as Product[]

  return (
    <div className="min-h-screen bg-goguma-cream">
      {/* 헤더 */}
      <header className="bg-white border-b border-lime-100 sticky top-0 z-10">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-800 transition-colors text-lg leading-none">
              ←
            </Link>
            <h1 className="font-bold text-gray-800">프로필</h1>
          </div>

          {isMe && (
            <Link
              href="/profile/edit"
              className="px-4 py-2 text-sm font-medium text-goguma border border-goguma rounded-xl hover:bg-lime-50 transition-colors"
            >
              프로필 수정
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-5 space-y-3">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl border border-lime-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-lime-100 border border-lime-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🧟</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold text-gray-800 truncate">{profile.nickname}</p>
              <p className="text-xs text-gray-400 mt-0.5">좀비 이웃</p>
            </div>
          </div>

          {/* 자기소개 */}
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mt-4">
            {profile.bio
              ? profile.bio
              : <span className="text-gray-300">{isMe ? '아직 자기소개가 없어요. 프로필을 수정해 나를 소개해보세요!' : '아직 자기소개가 없어요.'}</span>}
          </p>
        </div>

        {/* 글 모아보기 */}
        <div className="bg-white rounded-2xl border border-lime-100 overflow-hidden">
          <h2 className="font-bold text-gray-800 px-5 pt-5 pb-3">
            올린 글 <span className="text-goguma">{productList.length}</span>
          </h2>

          {productList.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-4xl mb-3">🧟</div>
              <p className="text-sm text-gray-400">아직 올린 글이 없어요.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {productList.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.id}`}
                    className="flex gap-4 px-4 py-4 hover:bg-lime-50 transition-colors"
                  >
                    {/* 썸네일 */}
                    <div className="w-20 h-20 rounded-2xl bg-lime-50 border border-lime-100 flex-shrink-0 overflow-hidden">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🧟
                        </div>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <p className="font-medium text-gray-800 truncate">{product.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 mb-2">
                        {product.category} · {formatTimeAgo(product.created_at)}
                      </p>
                      <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                    </div>

                    {/* 판매완료 뱃지 */}
                    {product.status !== 'selling' && (
                      <div className="flex-shrink-0 self-center">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                          판매완료
                        </span>
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
