'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addComment } from '@/app/actions'

type Props = {
  productId: string
}

export default function CommentForm({ productId }: Props) {
  const boundAddComment = addComment.bind(null, productId)
  const [state, action, isPending] = useActionState(boundAddComment, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  // 등록 성공(에러 없음)하면 입력창을 비웁니다.
  useEffect(() => {
    if (state === undefined) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <textarea
        name="content"
        rows={2}
        placeholder="따뜻한 댓글을 남겨주세요"
        required
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
      />

      {state && 'error' in state && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{state.error}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-goguma hover:bg-goguma-dark text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? '등록 중...' : '댓글 등록'}
        </button>
      </div>
    </form>
  )
}
