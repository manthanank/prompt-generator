import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  computed,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContentService } from '../../services/content';
import { Auth } from '../../services/auth';
import { MarkdownComponent } from 'ngx-markdown';
import { Visit } from '../../models/visit.model';
import { User, GenerateResponse, AnonymousStatusResponse, FreePromptCheckResponse } from '../../models/user.model';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-home',
  imports: [FormsModule, RouterModule, MarkdownComponent],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors p-4"
    >
      <div
        class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 border border-gray-200 dark:border-gray-700 relative"
      >
        <div class="flex justify-between items-center">
          <!-- Authentication Section -->
          <div class="flex items-center gap-4">
            @if (isAuthenticated()) {
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-300"
                >Welcome, {{ currentUser()?.username }}!</span
              >
              <button
                (click)="onLogout()"
                class="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
            } @else {
            <div class="flex items-center gap-2">
              <a
                routerLink="/login"
                class="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
              >
                Login
              </a>
              <a
                routerLink="/register"
                class="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
              >
                Register
              </a>
            </div>
            }
          </div>

          <!-- Dark Mode Toggle -->
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <span class="text-gray-700 dark:text-gray-200 text-base"
              >Dark Mode</span
            >
            <button
              type="button"
              (click)="toggleDarkMode()"
              [attr.aria-pressed]="darkMode()"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              [class.bg-blue-600]="darkMode()"
              [class.bg-gray-300]="!darkMode()"
            >
              <span class="sr-only">Toggle dark mode</span>
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                [class.translate-x-5]="darkMode()"
                [class.translate-x-1]="!darkMode()"
              >
              </span>
            </button>
          </label>
        </div>

        <div class="flex flex-col items-center space-y-2">
          <h1
            class="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight"
          >
            Prompt Generator
          </h1>
          @if (isVisitorCountLoading()) {
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Loading visitor count...
          </div>
          } @else if (visitorCountError()) {
          <div class="text-sm text-red-500 dark:text-red-400">
            Error loading visitor count
          </div>
          } @else {
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ visitorCount() }} visitors
          </div>
          }
        </div>

        <div class="space-y-4">
          @if (!isAuthenticated()) {
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center mb-4">
            @if (anonymousStatusLoading()) {
            <p class="text-blue-700 dark:text-blue-300 text-sm">
              Checking your free prompt status...
            </p>
            } @else if (hasUsedFreePrompt()) {
            <p class="text-red-700 dark:text-red-300 text-sm">
              ❌ You've used your free prompt. <a routerLink="/register" class="text-red-600 hover:text-red-700 font-medium">Register</a> for unlimited access.
            </p>
            } @else {
            <p class="text-blue-700 dark:text-blue-300 text-sm">
              🎁 You have 1 free prompt! <a routerLink="/register" class="text-blue-600 hover:text-blue-700 font-medium">Register</a> for unlimited access.
            </p>
            }
          </div>
          }
          <div>
            <label
              class="block text-gray-700 dark:text-gray-200 font-semibold mb-1"
              >Prompt Style</label
            >
            <select
              [ngModel]="selectedStyle()"
              (ngModelChange)="selectedStyle.set($event)"
              class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Creative">Creative</option>
              <option value="Formal">Formal</option>
              <option value="Funny">Funny</option>
              <option value="Concise">Concise</option>
            </select>
          </div>
          <div>
            <textarea
              [ngModel]="userInput()"
              (ngModelChange)="userInput.set($event)"
              rows="4"
              placeholder="Describe what you want..."
              class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-400 dark:placeholder-gray-500 placeholder-opacity-100 dark:placeholder-opacity-80"
              [disabled]="!isAuthenticated() && hasUsedFreePrompt()"
            ></textarea>
          </div>
          <button
            (click)="onGenerate()"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
            [disabled]="loading() || (!isAuthenticated() && hasUsedFreePrompt())"
          >
            {{ loading() ? 'Generating...' : 'Generate Prompt' }}
          </button>
        </div>

        @if (errorMessage()) {
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p class="text-red-700 dark:text-red-300 text-sm">
            {{ errorMessage() }}
          </p>
        </div>
        }

        @if (generatedPrompt()) {
        <div
          class="p-6 mt-2 bg-blue-50 dark:bg-blue-900 rounded-xl border border-blue-200 dark:border-blue-700 shadow-inner"
        >
          <h2 class="font-bold text-lg text-blue-800 dark:text-blue-200 mb-2">
            Generated Prompt:
          </h2>
          <div class="text-gray-800 dark:text-gray-100 break-words">
            <markdown [data]="generatedPrompt()"></markdown>
          </div>
          <div class="flex gap-3 mt-4">
            <button
              (click)="copyToClipboard()"
              class="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Copy
            </button>
            <button
              (click)="saveFavorite(generatedPrompt())"
              class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Save as Favorite
            </button>
          </div>
        </div>
        } @if (promptHistory().length) {
        <div
          class="mt-6 bg-gray-100 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
        >
          <h2 class="font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Prompt History
          </h2>
          <ul
            class="list-disc ml-6 text-sm space-y-1 text-gray-700 dark:text-gray-200"
          >
            @for (p of promptHistory(); track p) {
            <li><markdown [data]="p"></markdown></li>
            }
          </ul>
        </div>
        } @if (favoritePrompts().length) {
        <div
          class="mt-6 bg-yellow-50 dark:bg-yellow-900 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700"
        >
          <h2 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Favorites
          </h2>
          <ul
            class="list-disc ml-6 text-sm space-y-1 text-yellow-800 dark:text-yellow-100"
          >
            @for (fav of favoritePrompts(); track fav) {
            <li>{{ fav }}</li>
            }
          </ul>
        </div>
        }
      </div>
    </div>
  `,
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  protected readonly title = signal('prompt-generator');

  userInput = signal('');
  generatedPrompt = signal('');
  loading = signal(false);
  selectedStyle = signal('Creative');
  promptHistory = signal<string[]>([]);
  favoritePrompts = signal<string[]>([]);
  darkMode = signal(false);
  projectName = signal<string>('');
  errorMessage = signal<string>('');

  // Authentication signals
  currentUser = signal<User | null>(null);

  // Anonymous user status
  hasUsedFreePrompt = signal(false);
  anonymousStatusLoading = signal(false);

  private apiURL = environment.trackingApiUrl + '/api/visit';
  private contentService = inject(ContentService);
  private authService = inject(Auth);

  visitResource = httpResource<Visit>(() => ({
    url: this.apiURL,
    method: 'POST',
    body: { projectName: this.projectName() },
  }));

  visitorCount = computed(() => {
    const value = this.visitResource.value();
    return value?.uniqueVisitors ?? 0;
  });

  isVisitorCountLoading = computed(() => this.visitResource.isLoading());

  visitorCountError = computed(() => {
    const error = this.visitResource.error();
    return error ? error.message : null;
  });

  isAuthenticated = computed(() => {
    const user = this.currentUser();
    return !!user;
  });

  ngOnInit() {
    this.trackVisit();
    this.loadStoredData();
    this.setupDarkMode();
    this.subscribeToUserChanges();
    this.checkAnonymousStatus();
  }

  private trackVisit(): void {
    this.projectName.set(this.title());
  }

  private loadStoredData(): void {
    this.promptHistory.set(
      JSON.parse(localStorage.getItem('prompt-history') || '[]')
    );
    this.favoritePrompts.set(
      JSON.parse(localStorage.getItem('favorites') || '[]')
    );
  }

  private setupDarkMode(): void {
    const storedDarkMode = localStorage.getItem('dark-mode');
    if (storedDarkMode !== null) {
      this.darkMode.set(storedDarkMode === 'true');
      document.documentElement.classList.toggle('dark', this.darkMode());
    } else {
      this.darkMode.set(document.documentElement.classList.contains('dark'));
    }
  }

  private subscribeToUserChanges(): void {
    this.authService.currentUser.subscribe((user) => {
      this.currentUser.set(user);
    });
  }

  private checkAnonymousStatus(): void {
    if (!this.isAuthenticated()) {
      this.anonymousStatusLoading.set(true);
      this.contentService.checkFreePromptUsed().subscribe({
        next: (response: FreePromptCheckResponse) => {
          this.hasUsedFreePrompt.set(response.hasUsedFreePrompt);
          this.anonymousStatusLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to check anonymous status:', error);
          this.anonymousStatusLoading.set(false);
        }
      });
    }
  }

  onGenerate() {
    if (!this.userInput().trim()) return;
    if (!this.isAuthenticated() && this.hasUsedFreePrompt()) {
      this.errorMessage.set('You have already used your free prompt. Please register or login for unlimited access.');
      return;
    }

    const styledInput = `Generate a ${this.selectedStyle().toLowerCase()} prompt for: ${this.userInput()}`;
    this.loading.set(true);
    this.generatedPrompt.set('');
    this.errorMessage.set('');

    this.contentService.generateContent(styledInput).subscribe({
      next: (res: GenerateResponse) => {
        const text = res?.text || 'No response';
        this.generatedPrompt.set(text);
        this.saveToHistory(text);
        this.loading.set(false);

        // Update anonymous status if user is anonymous
        if (!this.isAuthenticated()) {
          this.hasUsedFreePrompt.set(true);
          // Refresh the anonymous status to ensure consistency
          this.checkAnonymousStatus();
        }
      },
      error: (error) => {
        console.error('Generate error:', error);
        this.errorMessage.set(error.error || 'Failed to generate prompt');
        this.loading.set(false);

        // If it's a 429 error (rate limit), update the status
        if (error.status === 429) {
          this.hasUsedFreePrompt.set(true);
        }
      },
    });
  }

  onLogout() {
    this.authService.logout();
    // Clear the current user signal
    this.currentUser.set(null);
    // Reset anonymous status when user logs out
    this.hasUsedFreePrompt.set(false);
    this.checkAnonymousStatus();
  }

  saveToHistory(prompt: string) {
    this.promptHistory.update((history) => [prompt, ...history].slice(0, 10));
    localStorage.setItem(
      'prompt-history',
      JSON.stringify(this.promptHistory())
    );
  }

  saveFavorite(prompt: string) {
    this.favoritePrompts.update((favs) => [...favs, prompt]);
    localStorage.setItem('favorites', JSON.stringify(this.favoritePrompts()));
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedPrompt()).then(() => {
      alert('Copied to clipboard!');
    });
  }

  toggleDarkMode() {
    this.darkMode.update((d) => !d);
    document.documentElement.classList.toggle('dark', this.darkMode());
    localStorage.setItem('dark-mode', String(this.darkMode()));
  }
}
