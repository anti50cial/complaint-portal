import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { PlatformService } from '../core/services/platform.service';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  currentUser = signal<User | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private platform: PlatformService
  ) {
    if (this.platform.isBrowser()) {
      this.loadUser();
    }
  }

  register(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register`, data).pipe(
      map(res => res.data)
    );
  }

  login(credentials: { email: string; password: any }): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      map(res => res.data),
      tap(data => {
        if (this.platform.isBrowser()) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        this.currentUser.set(data.user);
      })
    );
  }

  logout(): void {
    if (this.platform.isBrowser()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
    this.router.navigate([ '/login' ]);
  }

  private loadUser(): void {
    if (!this.platform.isBrowser()) return;

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser.set(JSON.parse(userStr));
      } catch (e) {
        this.logout();
      }
    }

    // Always try to sync profile from server if we have a token
    if (this.isAuthenticated()) {
      this.syncProfile();
    }
  }

  syncProfile(): void {
    this.getProfile().subscribe({
      next: (res) => {
        const user = res.data;
        this.currentUser.set(user);
        if (this.platform.isBrowser()) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },
      error: () => {
        // If profile fetch fails, maybe token is invalid
        // But we don't necessarily logout here to avoid aggressive kickouts on network error
      }
    });
  }

  getProfile(): Observable<ApiResponse<User>> {
    const token = localStorage.getItem('access_token');
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  isAuthenticated(): boolean {
    if (this.platform.isBrowser()) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  getRole(): 'STUDENT' | 'ADMIN' | null {
    return this.currentUser()?.role || null;
  }
}
