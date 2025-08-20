// src/app/interceptors/auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from './auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable, catchError, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isTokenExpired } from '../utils/token-utils';
import { SessionTimeoutDialogComponent } from '../components/modals/session-timeout/session-timeout-dialog.component';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(Auth);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  const userDetails = auth.getUserDetails();
  const token = userDetails?.access_token;
  const refreshToken = userDetails?.refresh_token;
  const refreshUrl = '/auth/refresh-token'; // adjust to your backend refresh endpoint

  // Skip refresh logic if the request is for the refresh endpoint
  if (req.url.includes(refreshUrl)) {
    return next(req);
  }

  let modifiedReq = req;
  if (token) {
    // Check token expiry
    if (isTokenExpired(token)) {
      console.log(isTokenExpired(token))
      if (auth.isUserActive()) {
        return auth.refreshAccessToken(refreshToken).pipe(
          switchMap((newToken: string) => {
            // if (!newToken) {
            //   console.warn('No new token received, logging out.');
            //   throw new Error('No token');
            // }
            console.log('Received new token:', newToken);
            auth.setAccessToken(newToken);
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(cloned);
          }),
          catchError((err) => {
            console.error('Refresh token failed:', err);
            auth.logout();
            router.navigate(['/login']);
            return throwError(() => new Error('Session expired'));
          })
        );
      } else {
        console.log('User inactive. Showing session timeout dialog.');
        dialog.open(SessionTimeoutDialogComponent, {
          width: '400px',
          disableClose: true,
        });
        auth.logout();
        router.navigate(['/login']);
        return throwError(() => new Error('Session expired'));
      }
    }
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        // Token expired or unauthorized
        alert('Session expired. Please Login again.');
        auth.logout(); // custom method to clear local/session storage
        router.navigate(['/login']); // redirect to login
      }

      return throwError(() => error);
    })
  );
};
