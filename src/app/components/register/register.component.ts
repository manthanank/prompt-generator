import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { AuthResponse } from '../../models/user.model';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors p-4">
      <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200 dark:border-gray-700">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Register</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Create your account for unlimited prompts</p>
        </div>

        <form (ngSubmit)="onRegister()" class="space-y-4">
          <div>
            <label class="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              [ngModel]="registerForm().username"
              (ngModelChange)="registerForm.set({username: $event, password: registerForm().password, email: registerForm().email})"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Choose a username"
              required>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              [ngModel]="registerForm().email"
              (ngModelChange)="registerForm.set({username: registerForm().username, password: registerForm().password, email: $event})"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required>
          </div>

          <div>
            <label class="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              [ngModel]="registerForm().password"
              (ngModelChange)="registerForm.set({username: registerForm().username, password: $event, email: registerForm().email})"
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Choose a password"
              required>
          </div>

          @if (registerError()) {
            <div class="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {{ registerError() }}
            </div>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-lg transition-colors">
            {{ loading() ? 'Creating account...' : 'Register' }}
          </button>
        </form>

        <div class="text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Already have an account?
            <a routerLink="/login" class="text-blue-600 hover:text-blue-700 font-medium">
              Login here
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
export class RegisterComponent {
  registerForm = signal({
    username: '',
    password: '',
    email: ''
  });

  loading = signal(false);
  registerError = signal('');

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  onRegister() {
    const { username, password, email } = this.registerForm();

    if (!username || !password || !email) {
      this.registerError.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.registerError.set('');

    this.authService.register(username, password, email).subscribe({
      next: (response: AuthResponse) => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading.set(false);
        this.registerError.set(error || 'Registration failed');
      }
    });
  }
}
