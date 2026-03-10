import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<string | null>(localStorage.getItem('username'));
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initAuth();
  }

  private initAuth(): void {
    const token = this.getToken();
    if (token) {
      this.fetchUser().subscribe({
        error: () => {
          this.refreshAccessToken().subscribe({
            next: () => this.fetchUser().subscribe(),
            error: () => this.logout()
          });
        }
      });
    }
  }

  register(username: string, email: string, password: string, country: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { username, email, password, country });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        if (res?.accessToken) {
          localStorage.setItem('token', res.accessToken);
          if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        }
      }),
      switchMap(() => this.fetchUser()),
      catchError(err => throwError(() => err))
    );
  }

  fetchUser(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/users/me').pipe(
      tap(user => {
        if (user?.username) {
          localStorage.setItem('username', user.username);
          this.currentUserSubject.next(user.username);
        }
      })
    );
  }

  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => 'No refresh token available');

    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(res => {
        if (res?.accessToken) {
          localStorage.setItem('token', res.accessToken);
        }
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null { return localStorage.getItem('token'); }
  getRefreshToken(): string | null { return localStorage.getItem('refreshToken'); }
  isLoggedIn(): boolean { return !!this.getToken(); }
}
