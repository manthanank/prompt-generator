import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { AuthResponse } from '../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors p-4">
      <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200 dark:border-gray-700">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Login</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Welcome back to Prompt Generator</p>
        </div>

        <form (ngSubmit)="onLogin()" class="space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              [ngModel]="loginForm().username"
              (ngModelChange)="loginForm.set({username: $event, password: loginForm().password})"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              [ngModel]="loginForm().password"
              (ngModelChange)="loginForm.set({username: loginForm().username, password: $event})"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required>
          </div>

          @if (loginError()) {
            <div class="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {{ loginError() }}
            </div>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors">
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Don't have an account?
            <a routerLink="/register" class="text-blue-600 hover:text-blue-700 font-medium">
              Register here
            </a>
          </p>
        </div>

        <div class="text-center">
          <a routerLink="/" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  loginForm = signal({
    username: '',
    password: ''
  });

  loading = signal(false);
  loginError = signal('');

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  onLogin() {
    const { username, password } = this.loginForm();

    if (!username || !password) {
      this.loginError.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.loginError.set('');

    this.authService.login(username, password).subscribe({
      next: (response: AuthResponse) => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading.set(false);
        this.loginError.set(error || 'Login failed');
      }
    });
  }
}
