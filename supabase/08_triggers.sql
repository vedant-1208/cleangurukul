-- 08_triggers.sql
-- Database triggers for automated audit logging and timestamp updates

-- 1. Trigger for issues status changes and resolution timestamp
create or replace function public.on_issue_state_change()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Auto-set resolved_at when status transitions to resolved
  if (new.status = 'resolved' and (old.status is null or old.status <> 'resolved')) then
    new.resolved_at := coalesce(new.resolved_at, now());
  elsif (new.status <> 'resolved') then
    new.resolved_at := null;
  end if;

  -- Insert audit log entry
  insert into public.audit_log (
    actor_id,
    actor_role,
    action,
    target_table,
    target_id,
    payload
  )
  values (
    auth.uid(),
    coalesce((select role from public.profiles where id = auth.uid()), 'system'),
    case
      when tg_op = 'INSERT' then 'ISSUE_CREATED'
      when tg_op = 'UPDATE' and old.status <> new.status then 'ISSUE_STATUS_CHANGED_TO_' || upper(new.status)
      else 'ISSUE_UPDATED'
    end,
    'issues',
    new.id,
    jsonb_build_object(
      'floor_code', new.floor_code,
      'status', new.status,
      'priority', new.priority,
      'assigned_to', new.assigned_to,
      'resolved_at', new.resolved_at
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_issues_audit on public.issues;
create trigger trg_issues_audit
  before insert or update on public.issues
  for each row execute procedure public.on_issue_state_change();

-- 2. Trigger for cleaning_logs reviews and status updates
create or replace function public.on_cleaning_log_review()
returns trigger
language plpgsql
security definer
as $$
begin
  if (tg_op = 'UPDATE' and old.status <> new.status) then
    new.reviewed_at := coalesce(new.reviewed_at, now());
    new.reviewer_id := coalesce(new.reviewer_id, auth.uid());

    insert into public.audit_log (
      actor_id,
      actor_role,
      action,
      target_table,
      target_id,
      payload
    )
    values (
      auth.uid(),
      coalesce((select role from public.profiles where id = auth.uid()), 'moderator'),
      'CLEANING_LOG_' || upper(new.status),
      'cleaning_logs',
      new.id,
      jsonb_build_object(
        'cleaner_id', new.cleaner_id,
        'division_id', new.division_id,
        'status', new.status,
        'reviewer_id', new.reviewer_id,
        'reviewed_at', new.reviewed_at,
        'review_remark', new.review_remark
      )
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_cleaning_logs_review on public.cleaning_logs;
create trigger trg_cleaning_logs_review
  before update on public.cleaning_logs
  for each row execute procedure public.on_cleaning_log_review();
