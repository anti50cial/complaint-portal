import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { PlatformService } from '../services/platform.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const platform = inject(PlatformService);
    const expectedRole = route.data[ 'role' ];

    if (platform.isBrowser()) {
        const user = authService.currentUser();
        if (user && user.role === expectedRole) {
            return true;
        }

        // Redirect if role doesn't match
        const redirectPath = user?.role === 'ADMIN' ? '/admin' : '/student-dashboard';
        return router.createUrlTree([ redirectPath ]);
    }

    return true;
};
