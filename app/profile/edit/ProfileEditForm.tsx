'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/actions'

type Profile = {
  id: string
  nickname: string
  bio: string | null
  avatar_url: string | null
}

export default function ProfileEditForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfile, undefined)
  const router = useRouter()
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state && 'redirectTo' in state) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
      setRemoveAvatar(false)
    }
  }

  const handleRemoveAvatar = () => {
    setPreviewUrl(null)
    setRemoveAvatar(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-goguma-cream">
      <header className="bg-white border-b border-lime-100 sticky top-0 z-10">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/users/${profile.id}`} className="text-gray-500 hover:text-gray-800 transition-colors">
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">프로필 수정</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        <form action={formAction} className="space-y-5">

          {/* 숨김 필드: 기존 사진 URL과 삭제 여부 전달 */}
          <input type="hidden" name="existing_avatar_url" value={profile.avatar_url ?? ''} />
          <input type="hidden" name="remove_avatar" value={removeAvatar ? 'true' : 'false'} />

          {/* 프로필 사진 */}
          <div className="bg-white rounded-2xl border border-lime-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              프로필 사진 <span className="text-gray-400 font-normal text-xs">(선택 · 최대 5MB)</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-lime-100 border border-lime-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="프로필 미리보기" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🧟</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="avatar-upload"
                  className="px-4 py-2 text-sm font-medium text-goguma border border-goguma rounded-xl hover:bg-lime-50 transition-colors cursor-pointer text-center"
                >
                  사진 {previewUrl ? '변경' : '추가'}
                </label>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    사진 삭제
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              id="avatar-upload"
              type="file"
              name="avatar"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* 닉네임 */}
          <div className="bg-white rounded-2xl border border-lime-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              닉네임 <span className="text-goguma">*</span>
            </label>
            <input
              type="text"
              name="nickname"
              defaultValue={profile.nickname}
              required
              minLength={2}
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-goguma focus:ring-2 focus:ring-goguma/20 transition-colors"
            />
          </div>

          {/* 자기소개 */}
          <div className="bg-white rounded-2xl border border-lime-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              자기소개
            </label>
            <textarea
              name="bio"
              defaultValue={profile.bio ?? ''}
              rows={4}
              maxLength={300}
              placeholder="나를 소개하는 글을 자유롭게 남겨보세요. 🧟"
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
