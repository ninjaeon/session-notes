# Session Notes Obsidian Plugin

## Description

Session Notes allows users to create and manage temporary notes and per-session notes directly in Obsidian. Temporary notes are automatically deleted when you switch away from them, and session notes are automatically deleted when the Obsidian app is closed.

## Features
- **Temporary Notes**: Quickly create a note that will be deleted once you switch away from it.
- **Session Notes**: Create session notes that persist through the session and are automatically deleted when the app closes.
- **Ribbon Button (optional)**: Toggle visibility of session notes in the workspace using a ribbon icon. You can show/hide this button from the plugin settings.
- **Open on Startup (optional)**: Automatically create and open a Session Note when Obsidian starts.

## Default Hotkeys
The plugin provides the following default key bindings out of the box:
- Open a temporary note: `Ctrl+Shift+;`
- Open a session note: `Ctrl+Shift+'`

You can customize these in Obsidian via **Settings → Hotkeys** by searching for "Session Notes" and changing the bindings as desired.

## Installation

### From GitHub
1. Download the latest release from the [Releases](https://github.com/tabibyte/session-notes/releases) page.
2. Extract the files and place them in your Obsidian plugins folder.
3. Restart Obsidian.
4. Open Settings → Community Plugins, and enable **Session Notes**.

## Settings
Open **Settings → Community Plugins → Session Notes** to configure:
- "Show ribbon button" — show/hide the ribbon icon that toggles Session Notes visibility.
- "Shows Session Note on Startup" — automatically create and open a Session Note on app start.
