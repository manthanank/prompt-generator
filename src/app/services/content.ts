import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { GenerateResponse, AnonymousStatusResponse, FreePromptCheckResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = environment.apiUrl;
  private sessionId: string;

  constructor(
    private http: HttpClient,
    private authService: Auth
  ) {
    this.sessionId = this.getSessionId();
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  generateContent(userPrompt: string): Observable<GenerateResponse> {
    const token = this.authService.token;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      // Authenticated user
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      // Anonymous user
      headers = headers.set('X-Session-ID', this.sessionId);
    }

    const body = { userPrompt };
    return this.http.post<GenerateResponse>(`${this.apiUrl}/api/generate-content`, body, { headers }).pipe(
      catchError(error => {
        console.error('Generate content error:', error);
        if (error.status === 429) {
          // Rate limit exceeded - user has used their free prompt
          return throwError(() => ({
            error: 'You have already used your free prompt. Please register or login for unlimited access.',
            userType: 'anonymous',
            requiresLogin: true
          }));
        }
        return throwError(() => error.error?.error || 'Failed to generate content');
      })
    );
  }

  getAnonymousStatus(): Observable<AnonymousStatusResponse> {
    const headers = new HttpHeaders({
      'X-Session-ID': this.sessionId
    });

    return this.http.get<AnonymousStatusResponse>(`${this.apiUrl}/api/anonymous-status`, { headers }).pipe(
      catchError(error => {
        console.error('Anonymous status error:', error);
        return throwError(() => error.error?.error || 'Failed to get anonymous status');
      })
    );
  }

  checkFreePromptUsed(): Observable<FreePromptCheckResponse> {
    const headers = new HttpHeaders({
      'X-Session-ID': this.sessionId
    });

    return this.http.get<FreePromptCheckResponse>(`${this.apiUrl}/api/check-free-prompt`, { headers }).pipe(
      catchError(error => {
        console.error('Check free prompt error:', error);
        return throwError(() => error.error?.error || 'Failed to check free prompt status');
      })
    );
  }

  clearSessions(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/clear-sessions`, {}).pipe(
      catchError(error => {
        console.error('Clear sessions error:', error);
        return throwError(() => error.error?.error || 'Failed to clear sessions');
      })
    );
  }

  clearSession(): void {
    localStorage.removeItem('sessionId');
    this.sessionId = this.getSessionId();
  }
}
