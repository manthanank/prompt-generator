# Prompt Generator

Instantly create high-quality AI prompts for any use case. Powered by Angular, Tailwind CSS, Google Gemini API, and a Node.js/Express backend.

## Features

- Generate creative, formal, funny, or concise prompts using Gemini AI
- Save prompt history and mark favorites (persisted in local storage)
- Copy generated prompts to clipboard
- Dark mode toggle
- Responsive, modern UI styled with Tailwind CSS
- **Node.js/Express backend for secure Gemini API access**

## Tech Stack

- [Angular 20+](https://angular.io/) (standalone components, signals, OnPush, reactive forms)
- [Tailwind CSS 4+](https://tailwindcss.com/) (utility-first styling)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- **Node.js + Express (backend API proxy)**

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
cd backend && npm install
```

### Environment Setup

#### Backend

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000 # optional, defaults to 3000
```

#### Frontend

The frontend is preconfigured to use the backend API at `http://localhost:3000/generate-content` (see `src/environments/environment.ts`). No API key is needed in the frontend.

### Development Server

Start the backend server:

```bash
cd backend
npm start
```

In a separate terminal, start the frontend:

```bash
npm start
```

Visit [http://localhost:4200](http://localhost:4200) to use the app.

### Build

```bash
ng build
```

## Usage

1. Select a prompt style (Creative, Formal, Funny, Concise)
2. Enter your prompt description
3. Click "Generate Prompt"
4. Copy or save generated prompts as favorites
5. Toggle dark mode as desired

## Project Structure

```tree
backend/
  index.js         # Express backend server
  package.json     # Backend dependencies
  .env             # Gemini API key (not committed)
src/
  app/
    app.ts         # Main app component (logic)
    app.html       # Main app template (UI)
    services/
      gemini.ts    # Frontend service calling backend
  environments/
    environment.ts # API endpoint config
  styles.css       # Tailwind CSS import and dark mode tweaks
```

## Styling

- 100% Tailwind CSS for all UI elements
- No custom CSS except minimal dark mode helpers

## License

[MIT](LICENSE)
