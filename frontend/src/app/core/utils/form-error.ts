import { HttpErrorResponse } from '@angular/common/http';

/** What went wrong when a form was sent. Each form shows the matching text from its content blocks (edited in the admin). */
export type FormFailure = 'too_many' | 'cv' | 'closed' | 'error';

export function formFailure(err: unknown): FormFailure {
  if (!(err instanceof HttpErrorResponse)) return 'error';
  if (err.status === 429) return 'too_many';
  if (err.status === 413) return 'cv'; // a file above the size limit
  const code = (err.error as { code?: string } | null)?.code;
  if (code === 'cv_missing' || code === 'cv_invalid') return 'cv';
  if (code === 'job_closed') return 'closed';
  return 'error';
}
