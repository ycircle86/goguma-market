import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions'

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
  profiles: { nickname: string }[] | null
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, category, status, created_at, image_url, profiles(nickname)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-goguma-cream">
      {/* 헤더 */}
      <header className="bg-white border-b border-lime-100 sticky top-0 z-10">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 font-bold text-gray-800 text-lg">
            <span className="inline-block transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">🧟</span>
            <span>고구마 마켓</span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href={`/users/${user.id}`}
                  className="text-sm text-gray-500 hover:text-goguma transition-colors hidden sm:block"
                >
                  {profile?.nickname ?? user.email}님
                </Link>
                <Link
                  href="/sell"
                  className="text-sm px-3 py-1.5 bg-goguma text-white rounded-full hover:bg-goguma-dark transition-colors"
                >
                  + 판매하기
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-sm px-3 py-1.5 border border-goguma text-goguma rounded-full hover:bg-goguma hover:text-white transition-colors"
                  >
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-goguma transition-colors">
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="text-sm px-3 py-1.5 bg-goguma text-white rounded-full hover:bg-goguma-dark transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 으스대는 좀비 히어로 배너 */}
      <section className="relative overflow-hidden border-b border-lime-200 bg-gradient-to-br from-lime-200 via-goguma-light to-lime-100">
        <div className="max-w-screen-md mx-auto px-5 py-8 flex items-center gap-4 sm:gap-6">
          {/* 으스대는 좀비 */}
          <div className="relative flex-shrink-0">
            <span className="text-6xl sm:text-7xl animate-swagger">🧟</span>
            <span className="absolute -top-1 -right-2 text-xl animate-sparkle">✨</span>
            <span className="absolute top-7 -left-3 text-base animate-sparkle [animation-delay:0.7s]">✨</span>
          </div>

          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-goguma-dark leading-snug">
              으스대는 좀비들의 중고 장터
            </h2>
            <p className="text-sm text-goguma-dark/70 mt-1.5">
              썩어도 준치! 우리 동네 좀비템을 거래해보세요 🦴
            </p>
          </div>
        </div>

        {/* 둥둥 떠다니는 배경 장식 */}
        <span className="absolute -bottom-2 right-6 text-3xl opacity-25 animate-float [animation-delay:0.4s]">🦴</span>
        <span className="absolute top-3 right-28 text-2xl opacity-20 animate-float [animation-delay:1.2s]">🧠</span>
      </section>

      {/* 상품 목록 */}
      <main className="max-w-screen-md mx-auto">
        {!products || products.length === 0 ? (
          <div className="text-center py-24 px-4">
            <div className="text-5xl mb-4"><span className="animate-swagger">🧟</span></div>
            <p className="font-semibold text-gray-600 mb-1">아직 깨어난 좀비템이 없어요</p>
            <p className="text-sm text-gray-400 mb-6">첫 번째 좀비템을 풀어놓아 보세요!</p>
            {user ? (
              <Link
                href="/sell"
                className="inline-block px-6 py-2.5 bg-goguma text-white font-semibold rounded-xl hover:bg-goguma-dark transition-colors"
              >
                판매하기
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 bg-goguma text-white font-semibold rounded-xl hover:bg-goguma-dark transition-colors"
              >
                로그인하고 시작하기
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 bg-white">
            {(products as Product[]).map((product, index) => (
              <li
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
              >
                <Link
                  href={`/products/${product.id}`}
                  className="group flex gap-4 px-4 py-4 hover:bg-lime-50 transition-colors"
                >
                  {/* 썸네일 */}
                  <div className="w-24 h-24 rounded-2xl bg-lime-50 border border-lime-100 flex-shrink-0 overflow-hidden">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6">
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
                    <p className="text-xs text-gray-400 mt-1">
                      {product.profiles?.[0]?.nickname ?? '알 수 없음'}
                    </p>
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
      </main>
    </div>
  )
}
