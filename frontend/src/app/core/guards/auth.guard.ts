import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree([ '/login' ], { queryParams: { returnUrl: state.url } });

  // During SSR, we don't have access to localStorage tokens.
  // If the page is protected, we can return true but the data-fetching-guards in components
  // will prevent sensitive data leakage during initial render.
  // A better way would be using cookies for SSR auth support.
};
