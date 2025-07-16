# Prompt Generator

Instantly create high-quality AI prompts for any use case. Powered by Angular, Tailwind CSS, and Google Gemini API.

## Features

- Generate creative, formal, funny, or concise prompts using Gemini AI
- Save prompt history and mark favorites (persisted in local storage)
- Copy generated prompts to clipboard
- Dark mode toggle
- Responsive, modern UI styled with Tailwind CSS

## Tech Stack

- [Angular 20+](https://angular.io/) (standalone components, signals, OnPush, reactive forms)
- [Tailwind CSS 4+](https://tailwindcss.com/) (utility-first styling)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Environment Setup

Set your Gemini API key in `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  geminiApiKey: 'YOUR_GEMINI_API_KEY',
};
```

### Development Server

```bash
npm start
```

Visit [http://localhost:4200](http://localhost:4200) to use the app.

### Build

```bash
npm run build
```

## Usage

1. Select a prompt style (Creative, Formal, Funny, Concise)
2. Enter your prompt description
3. Click "Generate Prompt"
4. Copy or save generated prompts as favorites
5. Toggle dark mode as desired

## Project Structure

```tree
src/
  app/
    app.ts         # Main app component (logic)
    app.html       # Main app template (UI)
    services/
      gemini.ts    # Gemini API integration service
  environments/
    environment.ts # API key config
  styles.css       # Tailwind CSS import and dark mode tweaks
```

## Styling

- 100% Tailwind CSS for all UI elements
- No custom CSS except minimal dark mode helpers

## License

[MIT](LICENSE)
