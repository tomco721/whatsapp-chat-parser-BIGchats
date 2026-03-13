# Changelog

All notable changes to this fork are documented in this file.

This project started from the original `whatsapp-chat-parser-website` and has been adapted into `WAreader`, a faster and more practical local viewer for large exported WhatsApp chats.

## [Fork Edition] - 2026-03-13

### Changed

- Repositioned the application layout so the sidebar gets its own desktop column instead of overlapping the chat viewer
- Centered the conversation area more naturally on wide screens while keeping the sidebar pinned to the left
- Kept the mobile and narrow-screen slide-out sidebar behavior for smaller displays
- Updated the credits link to point to the fork repository
- Rewrote the README to reflect the current fork instead of the original demo-style project description
- Added clearer setup notes for Windows users, including the `start.bat` workflow and `npm.cmd` fallback commands

### Improved

- Better desktop usability when browsing large conversations on wide monitors
- Cleaner reading flow by reducing wasted horizontal space in the message viewer
- More fork-ready project metadata and documentation for publishing to GitHub

## Fork Baseline

The current fork already includes the major capabilities that make it much more robust than the original early versions of the project:

### Added

- Search across messages with jump-to-result navigation and contextual message window loading
- Filtering by message index range
- Filtering by date range
- Active user switching
- Anonymous user mode
- Poll rendering support
- Attachment loading support designed to reduce unnecessary memory pressure
- Progressive message rendering for better responsiveness in large chats
- Inline display of supported media attachments from WhatsApp exports
- Dark mode support

### Improved

- Faster and smoother handling of larger exported chats
- Better day-to-day usability for local archive inspection
- Cleaner UI behavior across desktop and smaller screens

## Upstream Release History

The entries below summarize the original upstream project history prior to this fork-oriented changelog.

### [1.11.1] - 2024-10-26

- Updated dependencies
- Updated example chat to show new features
- Styled the button used to load attachments

### [1.11.0] - 2024-10-25

- Added graphical support for polls
- Added a button to load downloadable attachments
- Prevented loading or downloading attachments larger than 250MB

### [1.10.0] - 2024-08-02

- Added anonymous users toggle

### [1.9.0] - 2023-02-24

- Added date filtering
- Converted the project to TypeScript

### [1.8.0] - 2023-02-18

- Added message index display on hover or Ctrl
- Added upload focus improvements
- Added Jotai state management
- Migrated from create-react-app to Vite

### [1.7.0] - 2021-07-31

- Added active user switching from the sidebar

### [1.6.0] - 2021-03-09

- Added message range rendering
- Fixed emoji rendering and system message handling

### [1.5.0] - 2021-01-19

- Added clickable links
- Added media rendering for exports with attachments

### [1.4.0] - 2020-12-13

- Added dark mode support

### [1.3.3] - 2019-09-16

- Added the first changelog

### [1.2.0] - 2019-08-12

- Added the original sidebar and message amount controls

### [1.1.0] - 2019-07-31

- Added downloadable example chat and unsupported file error handling

### [1.0.0] - 2019-07-31

- Initial release
