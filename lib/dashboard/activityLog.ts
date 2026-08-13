import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type ActivityAction = 'article.created' | 'article.updated' | 'article.deleted' | 'article.status_changed' | 'user.invited' | 'match.imported';

export async function logActivity({
  userId, userEmail, action, targetId, targetTitle, meta,
}: {
  userId: string;
  userEmail: string;
  action: ActivityAction;
  targetId?: string;
  targetTitle?: string;
  meta?: Record<string, any>;
}) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from('activity_log').insert({
      user_id: userId,
      user_email: userEmail,
      action,
      target_id: targetId,
      target_title: targetTitle,
      meta: meta ?? {},
    });
  } catch {
    // Non-critical — never let logging failure break the main flow
  }
}
