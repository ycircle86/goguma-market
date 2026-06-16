'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleLike } from '@/app/actions'

type Props = {
  productId: string
  initialLiked: boolean
  initialCount: number
}

export default function LikeButton({ productId, initialLiked, initialCount }: Props) {
  const [isPending, startTransition] = useTransition()

  // 서버 응답을 기다리지 않고 화면을 먼저 바꿔주는 값 (낙관적 업데이트)
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    })
  )

  function handleClick() {
    startTransition(async () => {
      setOptimistic(null)
      await toggleLike(productId)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={optimistic.liked}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-60 ${
        optimistic.liked
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-white border-orange-100 text-gray-500 hover:bg-orange-50'
      }`}
    >
      <span className="text-lg leading-none">{optimistic.liked ? '❤️' : '🤍'}</span>
      <span>좋아요 {optimistic.count}</span>
    </button>
  )
}
