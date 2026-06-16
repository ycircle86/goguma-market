'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// useActionState와 함께 쓸 때는 redirect()가 "unexpected response" 에러를 유발함.
// 대신 redirectTo 필드를 반환하고, 클라이언트에서 useRouter로 이동.
export type ActionState = { error: string } | { redirectTo: string } | undefined

export async function login(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
  }

  revalidatePath('/', 'layout')
  return { redirectTo: '/' }
}

export async function signup(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nickname = formData.get('nickname') as string

  if (!email || !password || !nickname) {
    return { error: '모든 항목을 입력해주세요.' }
  }
  if (nickname.length < 2) {
    return { error: '닉네임은 2자 이상이어야 합니다.' }
  }
  if (password.length < 6) {
    return { error: '비밀번호는 6자 이상이어야 합니다.' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: '이미 사용 중인 이메일입니다.' }
    }
    return { error: '회원가입 중 오류가 발생했습니다.' }
  }

  return { redirectTo: '/login?message=가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// --- 이미지 업로드/삭제 헬퍼 ---

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function uploadImage(supabase: SupabaseClient, userId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${userId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filename, file, { contentType: file.type, upsert: false })
  if (error || !data) return null
  const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
  return publicUrl
}

async function deleteImage(supabase: SupabaseClient, imageUrl: string) {
  const parts = imageUrl.split('/product-images/')
  if (parts.length < 2) return
  await supabase.storage.from('product-images').remove([parts[1]])
}

function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return '이미지 파일만 업로드 가능합니다.'
  if (file.size > 5 * 1024 * 1024) return '이미지 크기는 5MB 이하여야 합니다.'
  return null
}

// --- 프로필 액션 ---

export async function updateProfile(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const nickname = (formData.get('nickname') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim() || null
  const imageFile = formData.get('avatar') as File | null
  const existingAvatarUrl = (formData.get('existing_avatar_url') as string) || null
  const removeAvatar = formData.get('remove_avatar') === 'true'

  if (!nickname) return { error: '닉네임을 입력해주세요.' }
  if (nickname.length < 2) return { error: '닉네임은 2자 이상이어야 합니다.' }

  let avatarUrl: string | null = existingAvatarUrl

  if (removeAvatar && existingAvatarUrl) {
    await deleteImage(supabase, existingAvatarUrl)
    avatarUrl = null
  } else if (imageFile && imageFile.size > 0) {
    const imgError = validateImageFile(imageFile)
    if (imgError) return { error: imgError }
    if (existingAvatarUrl) await deleteImage(supabase, existingAvatarUrl)
    avatarUrl = await uploadImage(supabase, user.id, imageFile)
    if (!avatarUrl) return { error: '이미지 업로드 중 오류가 발생했습니다.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ nickname, bio, avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') return { error: '이미 사용 중인 닉네임입니다.' }
    return { error: '프로필 수정 중 오류가 발생했습니다.' }
  }

  revalidatePath('/', 'layout')
  return { redirectTo: `/users/${user.id}` }
}

// --- 판매글 액션 ---

export async function createProduct(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const title = (formData.get('title') as string)?.trim()
  const priceStr = formData.get('price') as string
  const description = (formData.get('description') as string)?.trim()
  const category = formData.get('category') as string
  const imageFile = formData.get('image') as File | null

  if (!title) return { error: '제목을 입력해주세요.' }
  if (!priceStr) return { error: '가격을 입력해주세요.' }
  if (!description) return { error: '설명을 입력해주세요.' }
  if (!category) return { error: '카테고리를 선택해주세요.' }

  const price = parseInt(priceStr, 10)
  if (isNaN(price) || price < 0) return { error: '올바른 가격을 입력해주세요.' }

  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    const imgError = validateImageFile(imageFile)
    if (imgError) return { error: imgError }
    imageUrl = await uploadImage(supabase, user.id, imageFile)
    if (!imageUrl) return { error: '이미지 업로드 중 오류가 발생했습니다.' }
  }

  const { error } = await supabase.from('products').insert({
    title,
    price,
    description,
    category,
    seller_id: user.id,
    image_url: imageUrl,
  })

  if (error) {
    return { error: '판매글 등록 중 오류가 발생했습니다.' }
  }

  revalidatePath('/')
  return { redirectTo: '/' }
}

export async function updateProduct(id: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const title = (formData.get('title') as string)?.trim()
  const priceStr = formData.get('price') as string
  const description = (formData.get('description') as string)?.trim()
  const category = formData.get('category') as string
  const imageFile = formData.get('image') as File | null
  const existingImageUrl = (formData.get('existing_image_url') as string) || null
  const removeImage = formData.get('remove_image') === 'true'

  if (!title) return { error: '제목을 입력해주세요.' }
  if (!priceStr) return { error: '가격을 입력해주세요.' }
  if (!description) return { error: '설명을 입력해주세요.' }
  if (!category) return { error: '카테고리를 선택해주세요.' }

  const price = parseInt(priceStr, 10)
  if (isNaN(price) || price < 0) return { error: '올바른 가격을 입력해주세요.' }

  let imageUrl: string | null = existingImageUrl

  if (removeImage && existingImageUrl) {
    await deleteImage(supabase, existingImageUrl)
    imageUrl = null
  } else if (imageFile && imageFile.size > 0) {
    const imgError = validateImageFile(imageFile)
    if (imgError) return { error: imgError }
    if (existingImageUrl) await deleteImage(supabase, existingImageUrl)
    imageUrl = await uploadImage(supabase, user.id, imageFile)
    if (!imageUrl) return { error: '이미지 업로드 중 오류가 발생했습니다.' }
  }

  const { error } = await supabase
    .from('products')
    .update({ title, price, description, category, image_url: imageUrl })
    .eq('id', id)
    .eq('seller_id', user.id)

  if (error) return { error: '수정 중 오류가 발생했습니다.' }

  revalidatePath(`/products/${id}`)
  revalidatePath('/')
  return { redirectTo: `/products/${id}` }
}

// --- 댓글 액션 ---

export async function addComment(productId: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const content = (formData.get('content') as string)?.trim()
  if (!content) return { error: '댓글 내용을 입력해주세요.' }

  const { error } = await supabase.from('comments').insert({
    product_id: productId,
    user_id: user.id,
    content,
  })

  if (error) return { error: '댓글 등록 중 오류가 발생했습니다.' }

  revalidatePath(`/products/${productId}`)
  return undefined
}

export async function deleteComment(commentId: string, productId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  revalidatePath(`/products/${productId}`)
}

// --- 좋아요 액션 ---

// 좋아요가 없으면 추가, 있으면 취소(토글)
export async function toggleLike(productId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('likes').insert({ product_id: productId, user_id: user.id })
  }

  revalidatePath(`/products/${productId}`)
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: product } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  if (product?.image_url) {
    await deleteImage(supabase, product.image_url)
  }

  await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('seller_id', user.id)

  revalidatePath('/')
  redirect('/')
}
