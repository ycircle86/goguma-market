import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProduct } from '@/app/actions'
import EditForm from './EditForm'

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: product } = await supabase
    .from('products')
    .select('id, title, price, description, category, image_url')
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  // 본인 글이 아니거나 존재하지 않으면 상세 페이지로
  if (!product) redirect(`/products/${id}`)

  const boundAction = updateProduct.bind(null, id)
  return <EditForm product={product} action={boundAction} />
}
