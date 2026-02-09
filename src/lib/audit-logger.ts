
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
}

export const auditLogger = {
  async log(entry: AuditLogEntry) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) return;

      await supabase.from('audit_logs').insert({
        company_id: profile.company_id,
        user_id: user.id,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        details: entry.details,
        user_agent: navigator.userAgent,
        ip_address: 'client-side', // We can't reliably get IP client-side without an external service
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Fail silently to not disrupt user experience
    }
  }
};
