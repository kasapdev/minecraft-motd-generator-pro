# Minecraft MOTD Generator Pro

[![CI](https://github.com/kasapdev/minecraft-motd-generator-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/kasapdev/minecraft-motd-generator-pro/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) ![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-F7DF1E?logo=javascript&logoColor=black)

Build Minecraft server MOTD and chat text using the real, official `§` color and formatting codes — with a live server-list preview and JSON chat-component export.

> A premium, zero-dependency MOTD workbench for Minecraft Java Edition server owners. Type your two-line MOTD, click swatches to insert real `§`-coded color and formatting codes at your cursor, and watch it render exactly like Minecraft's own multiplayer server list — obfuscated text included. Copy the raw `§`-coded string for `server.properties`, or export a pretty-printed JSON chat component for plugins and data packs. Everything runs locally in your browser; nothing is ever sent anywhere.

## Overview

Minecraft MOTD Generator Pro is part of the **Web Utility Suite**. It runs entirely in the browser with no build step, no frameworks, and no network calls — open `index.html` from disk and it works. Two textareas represent the classic two-line server-list MOTD; a toolbar of color swatches and formatting buttons inserts the real Minecraft `§` codes (`§0`–`§f`, `§k`/`l`/`m`/`n`/`o`, `§r`) directly at your cursor position. A live preview renders your MOTD styled like Minecraft's actual dark server-list row, including an animated obfuscated-text effect for `§k` runs. Below that, copy-ready raw and JSON outputs update as you type.

## Features

- **16 real color codes** (`§0`–`§f`) with their official Minecraft hex values, plus all 6 formatting codes (`§k §l §m §n §o §r`) as clickable toolbar buttons.
- **Cursor-aware insertion** — codes are spliced into the textarea at the current caret position (not just appended), with focus and caret position restored after insertion.
- **Two-line MOTD editor** with a per-line visible-character counter that soft-warns past ~59 characters (Minecraft's traditional server-list line length) without blocking input.
- **Live server-list preview** styled after Minecraft's actual dark server-list row, using a Minecraft-esque monospace font stack, with correct color/bold/italic/underline/strikethrough rendering.
- **Animated obfuscated text** — `§k` runs randomly cycle their glyphs roughly every 50ms, just like in-game; disabled automatically for users with `prefers-reduced-motion: reduce`.
- **Raw `§`-coded output** — the exact pasteable string for `server.properties` `motd=`.
- **JSON chat-component export** — a pretty-printed JSON array of `{text, color, bold, italic, underline, strikethrough, obfuscated}` objects, one per formatting run.
- **Full code reference table** listing every color and formatting code with its swatch, name, and description.
- **Copy buttons** for both outputs, a **Clear** button, and **auto-persistence** of your MOTD text to `localStorage`.
- **Dark & light themes**, fully responsive, accessible, and keyboard-driven.

## Installation

No dependencies, no build step.

```bash
git clone https://github.com/kasapdev/minecraft-motd-generator-pro.git
cd minecraft-motd-generator-pro
```

Then simply open `index.html` in any modern browser (double-click it, or `file://` it). That's it.

## Usage

1. Type your MOTD into **Line 1** and **Line 2**, or start from the pre-loaded example.
2. Click a **color swatch** or **formatting button** to insert its `§` code at your current cursor position — click **§r Reset** to clear active formatting.
3. Watch the **Server List Preview** update live, rendered like Minecraft's real multiplayer server list, obfuscated runs included.
4. Copy the **raw `§`-coded string** for `server.properties`, or the **JSON chat component** for plugins, or check the **Code Reference** table for every code's meaning.
5. Click **Clear** to start over — your MOTD is auto-saved to `localStorage` as you type.

## Keyboard Shortcuts

| Action                        | Shortcut                              |
| ------------------------------ | -------------------------------------- |
| Copy raw §-coded string        | <kbd>Ctrl/⌘</kbd> + <kbd>C</kbd>        |
| Copy JSON chat component       | <kbd>Ctrl/⌘</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> |
| Show shortcuts help            | <kbd>?</kbd>                           |
| Close dialog                   | <kbd>Esc</kbd>                         |

## Screenshots

> _Screenshots coming soon._

## Roadmap

- [ ] Bedrock Edition formatting code support alongside Java Edition
- [ ] Preset MOTD templates (maintenance, whitelist, seasonal events)
- [ ] Import an existing `server.properties` to edit its MOTD in place
- [ ] Gradient/rainbow text generator using chained color runs
- [ ] Favicon (server-icon.png) preview alongside the MOTD row

## License

MIT Licensed. Part of the [Web Utility Suite](https://github.com/kasapdev/web-utility-suite).
