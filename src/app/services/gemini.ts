import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Gemini {
  private apiUrl = environment.apiUrl;

  http = inject(HttpClient);

  constructor() {}

  generatePrompt(userPrompt: string) {
    const body = { userPrompt };
    return this.http.post<any>(this.apiUrl, body);
  }
}
