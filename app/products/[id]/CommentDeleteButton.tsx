'use client'

import { deleteComment } from '@/app/actions'

type Props = {
  commentId: string
  productId: string
}

export default function CommentDeleteButton({ commentId, productId }: Props) {
  const boundDelete = deleteComment.bind(null, commentId, productId)

  return (
    <form
      action={boundDelete}
      onSubmit={(e) => {
        if (!confirm('댓글을 삭제할까요?')) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        삭제
      </button>
    </form>
  )
}
