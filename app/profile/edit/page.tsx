import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from './ProfileEditForm'

export default async function ProfileEditPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nickname, bio, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/')

  return <ProfileEditForm profile={profile} />
}
