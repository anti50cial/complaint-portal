import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { PlatformService } from '../services/platform.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platform = inject(PlatformService);

    if (platform.isBrowser()) {
        if (authService.isAuthenticated()) {
            return true;
        }
        return router.createUrlTree([ '/login' ], { queryParams: { returnUrl: state.url } });
    }

    // During SSR, we don't have access to localStorage tokens.
    // If the page is protected, we can return true but the data-fetching-guards in components
    // will prevent sensitive data leakage during initial render.
    // A better way would be using cookies for SSR auth support.
    return true;
};
