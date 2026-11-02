import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { adminUrl } from './admin-url';
import { AuthService } from './auth.service';

/** Everything except /admin/login requires a login. Unknown visitors are sent to /admin/login and returned afterwards. */
export const authGuard: CanActivateFn = async (_route, state) => {
  // inject() must happen before the first await.
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.ensureChecked();
  return auth.user() ? true : router.createUrlTree([adminUrl('/login')], { queryParams: { returnUrl: state.url } });
};
