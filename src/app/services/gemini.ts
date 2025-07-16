import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Gemini {
  private apiKey = environment.geminiApiKey;
  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

  http = inject(HttpClient);

  constructor() {}

  generatePrompt(userPrompt: string) {
    const body = {
      contents: [{ parts: [{ text: userPrompt }] }]
    };
    return this.http.post<any>(this.apiUrl, body);
  }
}
