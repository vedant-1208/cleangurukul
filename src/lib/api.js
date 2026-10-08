import { supabase } from '../config/supabaseClient.js';

/**
 * Inserts an entry into the audit_log table.
 */
export async function logAudit({ actorId, actorRole, action, targetTable, targetId, payload }) {
  try {
    const { error } = await supabase.from('audit_log').insert([
      {
        actor_id: actorId || null,
        actor_role: actorRole || 'system',
        action,
        target_table: targetTable,
        target_id: targetId || null,
        payload: payload || {},
      },
    ]);
    if (error) console.error('Failed to log audit event:', error);
  } catch (err) {
    console.error('Audit log exception:', err);
  }
}

// ==========================================
// PROFILES / USERS
// ==========================================

export async function getAllUsers(filters = {}) {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

  if (filters.role) {
    query = query.eq('role', filters.role);
  }
  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }
  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateUser(userId, patch, actor = {}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'admin',
    action: 'UPDATE_USER',
    targetTable: 'profiles',
    targetId: userId,
    payload: { patch, previousState: data },
  });

  return data;
}

export async function deactivateUser(userId, adminId, actor = {}) {
  const patch = {
    is_active: false,
    deactivated_at: new Date().toISOString(),
    deactivated_by: adminId,
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || adminId,
    actorRole: actor.role || 'admin',
    action: 'DEACTIVATE_USER',
    targetTable: 'profiles',
    targetId: userId,
    payload: patch,
  });

  return data;
}

export async function reactivateUser(userId, actor = {}) {
  const patch = {
    is_active: true,
    deactivated_at: null,
    deactivated_by: null,
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'admin',
    action: 'REACTIVATE_USER',
    targetTable: 'profiles',
    targetId: userId,
    payload: patch,
  });

  return data;
}

export async function promoteUser(userId, newRole, promoterId, actor = {}) {
  const patch = {
    role: newRole,
    promoted_by: promoterId,
    promoted_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || promoterId,
    actorRole: actor.role || 'admin',
    action: 'PROMOTE_USER',
    targetTable: 'profiles',
    targetId: userId,
    payload: { newRole, promoterId },
  });

  return data;
}

export async function demoteUser(userId, newRole, promoterId, actor = {}) {
  const patch = {
    role: newRole,
    promoted_by: promoterId,
    promoted_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || promoterId,
    actorRole: actor.role || 'superadmin',
    action: 'DEMOTE_USER',
    targetTable: 'profiles',
    targetId: userId,
    payload: { newRole, promoterId },
  });

  return data;
}

// ==========================================
// FLOORS & DIVISIONS
// ==========================================

export async function getFloors() {
  const { data, error } = await supabase
    .from('floors')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getDivisions({ floorCode, activeOnly = false } = {}) {
  let query = supabase
    .from('divisions')
    .select(`
      *,
      division_assignments (
        id,
        cleaner_id,
        is_active,
        profiles:cleaner_id ( id, full_name, email )
      )
    `)
    .order('name', { ascending: true });

  if (floorCode) {
    query = query.eq('floor_code', floorCode);
  }
  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createDivision({ floorCode, name, description, frequency, frequencyNotes }, actor = {}) {
  const row = {
    floor_code: floorCode,
    name,
    description,
    frequency: frequency || 'daily',
    frequency_notes: frequencyNotes,
    created_by: actor.id || null,
  };

  const { data, error } = await supabase
    .from('divisions')
    .insert([row])
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'superadmin',
    action: 'CREATE_DIVISION',
    targetTable: 'divisions',
    targetId: data.id,
    payload: row,
  });

  return data;
}

export async function updateDivision(divisionId, patch, actor = {}) {
  const { data, error } = await supabase
    .from('divisions')
    .update(patch)
    .eq('id', divisionId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'superadmin',
    action: 'UPDATE_DIVISION',
    targetTable: 'divisions',
    targetId: divisionId,
    payload: patch,
  });

  return data;
}

export async function deleteDivision(divisionId, actor = {}) {
  const { error } = await supabase
    .from('divisions')
    .delete()
    .eq('id', divisionId);

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'superadmin',
    action: 'DELETE_DIVISION',
    targetTable: 'divisions',
    targetId: divisionId,
    payload: { deletedDivisionId: divisionId },
  });

  return true;
}

export async function assignDivision(divisionId, cleanerId, actor = {}) {
  // Check if exists or insert
  const row = {
    division_id: divisionId,
    cleaner_id: cleanerId,
    assigned_by: actor.id || null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('division_assignments')
    .insert([row])
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'superadmin',
    action: 'ASSIGN_DIVISION',
    targetTable: 'division_assignments',
    targetId: data.id,
    payload: row,
  });

  return data;
}

export async function unassignDivision(assignmentId, actor = {}) {
  const { error } = await supabase
    .from('division_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'superadmin',
    action: 'UNASSIGN_DIVISION',
    targetTable: 'division_assignments',
    targetId: assignmentId,
    payload: { assignmentId },
  });

  return true;
}

export async function getAssignedCleaners(divisionId) {
  const { data, error } = await supabase
    .from('division_assignments')
    .select('*, profiles:cleaner_id(*)')
    .eq('division_id', divisionId)
    .eq('is_active', true);

  if (error) throw error;
  return data;
}

// ==========================================
// CLEANING LOGS (SCHEDULED CLEANING PROOF)
// ==========================================

export async function createCleaningLog({ cleanerId, divisionId, floorCode, photoUrl, photoTakenAt, notes }, actor = {}) {
  const row = {
    cleaner_id: cleanerId,
    division_id: divisionId,
    floor_code: floorCode,
    photo_url: photoUrl,
    photo_taken_at: photoTakenAt || new Date().toISOString(),
    notes: notes || '',
    status: 'pending_review',
  };

  const { data, error } = await supabase
    .from('cleaning_logs')
    .insert([row])
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || cleanerId,
    actorRole: actor.role || 'cleaner',
    action: 'CREATE_CLEANING_LOG',
    targetTable: 'cleaning_logs',
    targetId: data.id,
    payload: row,
  });

  return data;
}

export async function getMyCleaningLogs(cleanerId) {
  const { data, error } = await supabase
    .from('cleaning_logs')
    .select('*, divisions(name, floor_code), reviewer:reviewer_id(full_name)')
    .eq('cleaner_id', cleanerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCleaningLogsForReview({ status, floorCode, divisionId } = {}) {
  let query = supabase
    .from('cleaning_logs')
    .select('*, divisions(name, floor_code), cleaner:cleaner_id(full_name, email), reviewer:reviewer_id(full_name)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }
  if (floorCode) {
    query = query.eq('floor_code', floorCode);
  }
  if (divisionId) {
    query = query.eq('division_id', divisionId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function reviewCleaningLog(logId, status, reviewerId, remark, actor = {}) {
  const patch = {
    status,
    reviewer_id: reviewerId,
    reviewed_at: new Date().toISOString(),
    review_remark: remark,
  };

  const { data, error } = await supabase
    .from('cleaning_logs')
    .update(patch)
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || reviewerId,
    actorRole: actor.role || 'moderator',
    action: `REVIEW_CLEANING_LOG_${status.toUpperCase()}`,
    targetTable: 'cleaning_logs',
    targetId: logId,
    payload: patch,
  });

  return data;
}

export async function getComplianceSummary({ from, to } = {}) {
  let query = supabase
    .from('cleaning_logs')
    .select('id, division_id, floor_code, status, created_at, cleaner_id');

  if (from) {
    query = query.gte('created_at', from);
  }
  if (to) {
    query = query.lte('created_at', to);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ==========================================
// ISSUES (STUDENT / STAFF REPORTING)
// ==========================================

export async function createIssue({
  reporterId,
  reporterRole,
  floorCode,
  divisionId,
  locationType,
  room,
  description,
  photoUrl,
  photoTakenAt,
}, actor = {}) {
  const row = {
    reporter_id: reporterId,
    reporter_role: reporterRole,
    floor_code: floorCode,
    division_id: divisionId || null,
    location_type: locationType,
    room: room || '',
    description: description || '',
    photo_url: photoUrl,
    photo_taken_at: photoTakenAt || new Date().toISOString(),
    status: 'pending',
    priority: 'normal',
  };

  const { data, error } = await supabase
    .from('issues')
    .insert([row])
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || reporterId,
    actorRole: actor.role || reporterRole,
    action: 'CREATE_ISSUE',
    targetTable: 'issues',
    targetId: data.id,
    payload: row,
  });

  return data;
}

export async function getMyIssues(userId) {
  const { data, error } = await supabase
    .from('issues')
    .select('*, divisions(name), assignee:assigned_to(full_name)')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getIssuesForCleaner(cleanerId) {
  // Find cleaner's assigned divisions
  const { data: assignments } = await supabase
    .from('division_assignments')
    .select('division_id')
    .eq('cleaner_id', cleanerId)
    .eq('is_active', true);

  const divisionIds = assignments ? assignments.map((a) => a.division_id) : [];

  let query = supabase
    .from('issues')
    .select('*, divisions(name), reporter:reporter_id(full_name, room)')
    .order('created_at', { ascending: false });

  if (divisionIds.length > 0) {
    query = query.or(`assigned_to.eq.${cleanerId},division_id.in.(${divisionIds.join(',')})`);
  } else {
    query = query.eq('assigned_to', cleanerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAllIssues(filters = {}) {
  let query = supabase
    .from('issues')
    .select('*, divisions(name), reporter:reporter_id(full_name, room), assignee:assigned_to(full_name)')
    .order('created_at', { ascending: false });

  if (filters.floorCode) {
    query = query.eq('floor_code', filters.floorCode);
  }
  if (filters.divisionId) {
    query = query.eq('division_id', filters.divisionId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateIssueStatus(issueId, status, extra = {}, actor = {}) {
  const patch = { status, ...extra };
  if (status === 'resolved' && !patch.resolved_at) {
    patch.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('issues')
    .update(patch)
    .eq('id', issueId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role,
    action: `UPDATE_ISSUE_STATUS_${status.toUpperCase()}`,
    targetTable: 'issues',
    targetId: issueId,
    payload: patch,
  });

  return data;
}

export async function assignIssue(issueId, cleanerId, actor = {}) {
  const patch = {
    assigned_to: cleanerId,
    status: 'in_progress',
  };

  const { data, error } = await supabase
    .from('issues')
    .update(patch)
    .eq('id', issueId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'admin',
    action: 'ASSIGN_ISSUE',
    targetTable: 'issues',
    targetId: issueId,
    payload: { assigned_to: cleanerId },
  });

  return data;
}

export async function adminUpdateIssue(issueId, patch, adminId, actor = {}) {
  const fullPatch = {
    ...patch,
    edited_by_admin: adminId,
  };

  const { data, error } = await supabase
    .from('issues')
    .update(fullPatch)
    .eq('id', issueId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || adminId,
    actorRole: actor.role || 'admin',
    action: 'ADMIN_UPDATE_ISSUE',
    targetTable: 'issues',
    targetId: issueId,
    payload: fullPatch,
  });

  return data;
}

export async function adminResolveOnBehalf(issueId, resolutionPhotoUrl, adminId, actor = {}) {
  const patch = {
    status: 'resolved',
    resolution_photo_url: resolutionPhotoUrl,
    resolved_at: new Date().toISOString(),
    edited_by_admin: adminId,
  };

  const { data, error } = await supabase
    .from('issues')
    .update(patch)
    .eq('id', issueId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || adminId,
    actorRole: actor.role || 'admin',
    action: 'ADMIN_RESOLVE_ON_BEHALF',
    targetTable: 'issues',
    targetId: issueId,
    payload: patch,
  });

  return data;
}

export async function adminReopenIssue(issueId, adminId, actor = {}) {
  const patch = {
    status: 'pending',
    resolved_at: null,
    edited_by_admin: adminId,
  };

  const { data, error } = await supabase
    .from('issues')
    .update(patch)
    .eq('id', issueId)
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || adminId,
    actorRole: actor.role || 'admin',
    action: 'ADMIN_REOPEN_ISSUE',
    targetTable: 'issues',
    targetId: issueId,
    payload: patch,
  });

  return data;
}

export async function adminDeleteIssue(issueId, adminId, actor = {}) {
  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', issueId);

  if (error) throw error;

  await logAudit({
    actorId: actor.id || adminId,
    actorRole: actor.role || 'admin',
    action: 'ADMIN_DELETE_ISSUE',
    targetTable: 'issues',
    targetId: issueId,
    payload: { deletedIssueId: issueId },
  });

  return true;
}

export async function bulkAssignIssues(issueIds, cleanerId, adminId, actor = {}) {
  const patch = {
    assigned_to: cleanerId,
    status: 'in_progress',
    edited_by_admin: adminId,
  };

  const { data, error } = await supabase
    .from('issues')
    .update(patch)
    .in('id', issueIds)
    .select();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || adminId,
    actorRole: actor.role || 'admin',
    action: 'BULK_ASSIGN_ISSUES',
    targetTable: 'issues',
    targetId: null,
    payload: { issueIds, cleanerId },
  });

  return data;
}

export async function bulkUpdateStatus(issueIds, status, adminId, actor = {}) {
  const patch = {
    status,
    edited_by_admin: adminId,
  };
  if (status === 'resolved') {
    patch.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('issues')
    .update(patch)
    .in('id', issueIds)
    .select();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || adminId,
    actorRole: actor.role || 'admin',
    action: `BULK_UPDATE_STATUS_${status.toUpperCase()}`,
    targetTable: 'issues',
    targetId: null,
    payload: { issueIds, status },
  });

  return data;
}

// ==========================================
// COMMENTS & NOTICES
// ==========================================

export async function addIssueComment({ issueId, message, visibleToReporter = true }, actor = {}) {
  const row = {
    issue_id: issueId,
    author_id: actor.id || null,
    author_role: actor.role || 'user',
    message,
    visible_to_reporter: visibleToReporter,
  };

  const { data, error } = await supabase
    .from('issue_comments')
    .insert([row])
    .select('*, author:author_id(full_name, role)')
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'user',
    action: 'ADD_ISSUE_COMMENT',
    targetTable: 'issue_comments',
    targetId: data.id,
    payload: row,
  });

  return data;
}

export async function getIssueComments(issueId) {
  const { data, error } = await supabase
    .from('issue_comments')
    .select('*, author:author_id(full_name, role)')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function addCleaningLogComment({ logId, message }, actor = {}) {
  const row = {
    log_id: logId,
    author_id: actor.id || null,
    author_role: actor.role || 'user',
    message,
  };

  const { data, error } = await supabase
    .from('cleaning_log_comments')
    .insert([row])
    .select('*, author:author_id(full_name, role)')
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id,
    actorRole: actor.role || 'user',
    action: 'ADD_CLEANING_LOG_COMMENT',
    targetTable: 'cleaning_log_comments',
    targetId: data.id,
    payload: row,
  });

  return data;
}

export async function getCleaningLogComments(logId) {
  const { data, error } = await supabase
    .from('cleaning_log_comments')
    .select('*, author:author_id(full_name, role)')
    .eq('log_id', logId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function sendNotice({ recipientId, senderId, title, body }, actor = {}) {
  const row = {
    recipient_id: recipientId,
    sender_id: senderId,
    title,
    body,
  };

  const { data, error } = await supabase
    .from('student_notices')
    .insert([row])
    .select()
    .single();

  if (error) throw error;

  await logAudit({
    actorId: actor.id || senderId,
    actorRole: actor.role || 'admin',
    action: 'SEND_NOTICE',
    targetTable: 'student_notices',
    targetId: data.id,
    payload: row,
  });

  return data;
}

export async function getNoticesForUser(userId) {
  const { data, error } = await supabase
    .from('student_notices')
    .select('*, sender:sender_id(full_name)')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markNoticeRead(noticeId) {
  const { data, error } = await supabase
    .from('student_notices')
    .update({ read_at: new Date().toISOString() })
    .eq('id', noticeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ==========================================
// AUDIT LOG & ANALYTICS
// ==========================================

export async function getAuditLog({ from, to, actorId, action } = {}) {
  let query = supabase
    .from('audit_log')
    .select('*, actor:actor_id(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  if (actorId) query = query.eq('actor_id', actorId);
  if (action) query = query.ilike('action', `%${action}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAnalyticsFiltered({ from, to, cleanerId, floorCode, status, divisionId } = {}) {
  let issuesQuery = supabase.from('issues').select('*');
  let logsQuery = supabase.from('cleaning_logs').select('*');

  if (from) {
    issuesQuery = issuesQuery.gte('created_at', from);
    logsQuery = logsQuery.gte('created_at', from);
  }
  if (to) {
    issuesQuery = issuesQuery.lte('created_at', to);
    logsQuery = logsQuery.lte('created_at', to);
  }
  if (cleanerId) {
    issuesQuery = issuesQuery.eq('assigned_to', cleanerId);
    logsQuery = logsQuery.eq('cleaner_id', cleanerId);
  }
  if (floorCode) {
    issuesQuery = issuesQuery.eq('floor_code', floorCode);
    logsQuery = logsQuery.eq('floor_code', floorCode);
  }
  if (status) {
    issuesQuery = issuesQuery.eq('status', status);
    logsQuery = logsQuery.eq('status', status);
  }
  if (divisionId) {
    issuesQuery = issuesQuery.eq('division_id', divisionId);
    logsQuery = logsQuery.eq('division_id', divisionId);
  }

  const [issuesRes, logsRes] = await Promise.all([issuesQuery, logsQuery]);
  if (issuesRes.error) throw issuesRes.error;
  if (logsRes.error) throw logsRes.error;

  return {
    issues: issuesRes.data,
    cleaningLogs: logsRes.data,
  };
}

export async function getCleanerComplianceTable({ from, to } = {}) {
  // Returns compliance stats grouped by cleaner and division
  const logs = await getComplianceSummary({ from, to });
  const cleaners = await getAllUsers({ role: 'cleaner' });
  const divisions = await getDivisions();

  return {
    logs,
    cleaners,
    divisions,
  };
}
