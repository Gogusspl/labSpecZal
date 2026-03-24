import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, from } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('accessToken');
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth/refresh')) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          return throwError(() => error);
        }

        return from(
          fetch('http://localhost:8080/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          }).then(res => {
            if (!res.ok) throw new Error("Refresh failed");
            return res.json();
          })
        ).pipe(
          switchMap((data: any) => {
            localStorage.setItem('accessToken', data.accessToken);
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${data.accessToken}` }
            });
            return next(retryReq);
          }),
          catchError(err => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('username');
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
