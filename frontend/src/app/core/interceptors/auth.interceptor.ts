import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { PlatformService } from '../services/platform.service';
import { AuthService } from '../../auth/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const platform = inject(PlatformService);
    const authService = inject(AuthService);

    let nextRequest = next;
    let modifiedReq = req;

    if (platform.isBrowser()) {
        const token = localStorage.getItem('access_token');

        if (token) {
            modifiedReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    }

    return next(modifiedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                authService.logout();
            }
            return throwError(() => error);
        })
    );
};
