import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, AuthResponse, ProfileResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('token');
  }

  register(username: string, password: string, email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, {
      username,
      password,
      email
    }).pipe(
      map(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
        return response;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error.error?.error || 'Registration failed');
      })
    );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      username,
      password
    }).pipe(
      map(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
        return response;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error.error?.error || 'Login failed');
      })
    );
  }

  getProfile(): Observable<ProfileResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProfileResponse>(`${this.apiUrl}/auth/profile`, { headers }).pipe(
      catchError(error => {
        console.error('Profile error:', error);
        return throwError(() => error.error?.error || 'Failed to get profile');
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.token;
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }
}
