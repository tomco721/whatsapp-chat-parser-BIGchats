# whatsapp-chat-parser-bigchats

Fast local viewer for exported WhatsApp chats with media support, search, filtering, anonymization, automatic incremental loading, and a desktop-friendly reading layout.

This project started from the original `whatsapp-chat-parser-website`, but it has evolved into a much more capable day-to-day tool for exploring large chat exports quickly and comfortably.

## What It Does

- Opens WhatsApp exports from `.txt` files or exported `.zip` archives
- Renders attached media directly when the export contains images, audio, or video
- Filters the visible range by message index or by date
- Searches chat content and jumps straight to matching messages with surrounding context
- Lets you choose the active user to render the conversation from either side
- Supports anonymizing participant names on the fly
- Handles large conversations efficiently with progressive rendering
- Automatically loads more messages while you scroll through long chats
- Keeps all processing local in the browser

## Why This Fork

Compared to the original demo-style version, this fork is focused on usability and performance for real-world archives:

- more robust browsing of long conversations
- much faster interaction on large datasets
- cleaner filtering and search workflow
- improved media handling
- better desktop layout with a persistent sidebar on wide screens
- smoother reading experience with automatic message loading on scroll
- still simple to run locally with no backend

## Local Development

### Requirements

- [Node.js](https://nodejs.org/)

### Quick Start On Windows

If you are on Windows, the easiest way is to run:

```bat
start.bat
```

This script will:

- install dependencies automatically if needed
- start the local development server

So for most users, installing Node.js and launching `start.bat` is enough.

### Install

```bash
npm install
```

### Start Dev Server

```bash
npm start
```

If PowerShell blocks `npm`, use:

```bat
npm.cmd start
```

### Lint

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

If needed on Windows:

```bat
npm.cmd run build
```

The production bundle is generated in `build/`.

## How To Use

1. Export a WhatsApp chat as `.txt` or `.zip`
2. Open the app locally
3. Drop the file into the upload area or load the example chat
4. Browse messages, search phrases, narrow by range/date, and inspect media inline
5. Keep scrolling to automatically load more messages in long conversations

If you export the chat with media attached, the app can display supported attachments directly from the archive.

## Exporting WhatsApp Chats

- [Android export guide](https://faq.whatsapp.com/android/chats/how-to-save-your-chat-history)
- [iPhone export guide](https://faq.whatsapp.com/iphone/chats/how-to-back-up-to-icloud/)

## Stack

- [TypeScript](https://www.typescriptlang.org/)
- [React 18](https://react.dev/)
- [Jotai](https://jotai.org/)
- [Styled Components](https://styled-components.com/)
- [JSZip](https://stuk.github.io/jszip/)
- [whatsapp-chat-parser](https://github.com/Pustur/whatsapp-chat-parser)
- [Vite](https://vitejs.dev/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

## Privacy

The app is designed to run locally. Chat files are parsed in the browser and are not uploaded anywhere by default.

## Changelog

[CHANGELOG](CHANGELOG.md)

## License

[MIT](LICENSE)
