import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

type Role = 'admin' | 'manager' | 'viewer'

export function useRBAC() {
  const [roles, setRoles] = useState<Role[]>(['viewer'])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const r = (user?.user_metadata?.roles as Role[] | undefined) || ['admin']
      setRoles(r)
    })
  }, [])

  const can = (perm: 'edit_coa' | 'post_journal' | 'dispose_asset') => {
    if (roles.includes('admin')) return true
    if (perm === 'post_journal') return roles.includes('manager')
    return false
  }

  return { roles, can }
}

