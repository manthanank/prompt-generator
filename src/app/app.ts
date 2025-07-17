import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Gemini } from './services/gemini';
import { MarkdownComponent } from 'ngx-markdown';
import { Visit } from './models/visit.model';
import { httpResource } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [FormsModule, MarkdownComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('prompt-generator');

  userInput = signal('');
  generatedPrompt = signal('');
  loading = signal(false);
  selectedStyle = signal('Creative');
  promptHistory = signal<string[]>([]);
  favoritePrompts = signal<string[]>([]);
  darkMode = signal(false);
  projectName = signal<string>('');

  private apiURL = environment.trackingApiUrl;
  private geminiService = inject(Gemini);

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

  ngOnInit() {
    this.trackVisit();
    this.promptHistory.set(
      JSON.parse(localStorage.getItem('prompt-history') || '[]')
    );
    this.favoritePrompts.set(
      JSON.parse(localStorage.getItem('favorites') || '[]')
    );
    const storedDarkMode = localStorage.getItem('dark-mode');
    if (storedDarkMode !== null) {
      this.darkMode.set(storedDarkMode === 'true');
      document.documentElement.classList.toggle('dark', this.darkMode());
    } else {
      this.darkMode.set(document.documentElement.classList.contains('dark'));
    }
  }

  private trackVisit(): void {
    // Update the signal to trigger the httpResource
    this.projectName.set(this.title());
  }

  onGenerate() {
    if (!this.userInput().trim()) return;

    const styledInput = `Generate a ${this.selectedStyle().toLowerCase()} prompt for: ${this.userInput()}`;
    this.loading.set(true);
    this.generatedPrompt.set('');

    this.geminiService.generatePrompt(styledInput).subscribe({
      next: (res) => {
        const text = res?.text || 'No response';
        this.generatedPrompt.set(text);
        this.saveToHistory(text);
        this.loading.set(false);
      },
      error: () => {
        this.generatedPrompt.set('Error generating prompt');
        this.loading.set(false);
      },
    });
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
