'use client'

type Props = {
  action: () => Promise<void>
}

export default function DeleteButton({ action }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('정말 삭제할까요? 되돌릴 수 없어요.')) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
      >
        삭제
      </button>
    </form>
  )
}
