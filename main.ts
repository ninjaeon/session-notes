import { Plugin, TFile, PluginSettingTab, Setting } from 'obsidian';

interface SNoteSettings {
  showRibbonButton: boolean;
  showSessionNoteOnStartup: boolean;
}

const DEFAULT_SETTINGS: SNoteSettings = {
  showRibbonButton: true,
  showSessionNoteOnStartup: false,
};

export default class SNote extends Plugin {
  private sessionNotes: TFile[] = [];
  private tempNote?: TFile;

  settings: SNoteSettings = DEFAULT_SETTINGS;
  private ribbonEl?: HTMLElement;

  async onload() {
    await this.loadSettings();

    // Auto-open a Session Note on startup if enabled, after layout is ready
    this.app.workspace.onLayoutReady(() => {
      if (this.settings.showSessionNoteOnStartup) {
        this.openSessionNote();
      }
    });

    // Commands
    this.addCommand({
      id: 'open-temp-note',
      name: 'Open a temporary note (delete on change)',
      hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: ';' }],
      callback: () => this.openTempNote(),
    });

    this.addCommand({
      id: 'open-session-note',
      name: 'Open a session note (delete on app close)',
      hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: '\'' }],
      callback: () => this.openSessionNote(),
    });

    // Ribbon (conditionally added based on settings)
    this.updateRibbon();

    // Settings tab
    this.addSettingTab(new SNoteSettingTab(this.app, this));

    // Lifecycle hooks
    window.addEventListener('beforeunload', (event) => {
      if (this.sessionNotes.length === 0) {
        return;
      }

      event.preventDefault();
      this.deleteSessionNotes();
    });

    this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
      this.checkTempNoteDeletion();
    }));
  }

  async openTempNote() {
    const file = await this.app.vault.create('Temp Note.md', '');
    this.tempNote = file;
    const leaf = this.app.workspace.getLeaf();
    leaf.openFile(file);
  }

  async openSessionNote() {
    let count = 1;
    let baseName = 'Session Note';
    let newFileName = `${baseName} ${count}.md`;

    while (this.app.vault.getAbstractFileByPath(newFileName)) {
      count++;
      newFileName = `${baseName} ${count}.md`;
    }

    const file = await this.app.vault.create(newFileName, '');
    this.sessionNotes.push(file);
    const leaf = this.app.workspace.getLeaf();
    leaf.openFile(file);
  }

  checkTempNoteDeletion() {
    const activeFile = this.app.workspace.getActiveFile();
    
    if (this.tempNote && (!activeFile || activeFile.path !== this.tempNote.path)) {
      this.app.vault.delete(this.tempNote);
      this.tempNote = undefined;
    }
  }

  async deleteSessionNotes() {
    const deletionPromises = this.sessionNotes.map(async (note) => {
      try {
        await this.app.vault.delete(note);
      } catch (error) {
        console.error(`Failed to delete session note: ${note.path}`, error);
      }
    });

    await Promise.allSettled(deletionPromises);
    this.sessionNotes = [];
    window.close();
  }

  // Toggle show/hide of session notes in the workspace
  toggleSessionNotesVisibility() {
    const sessionSet = new Set(this.sessionNotes.map((f) => f.path));
    const leaves = this.app.workspace.getLeavesOfType('markdown');

    // Are any session notes currently open?
    const sessionLeaves = leaves.filter((l: any) => l?.view?.file && sessionSet.has(l.view.file.path));

    if (sessionLeaves.length > 0) {
      // Hide: close all leaves that display session notes
      sessionLeaves.forEach((l: any) => l.detach());
    } else if (this.sessionNotes.length > 0) {
      // Show: open the most recent session note
      const last = this.sessionNotes[this.sessionNotes.length - 1];
      const leaf = this.app.workspace.getLeaf();
      leaf.openFile(last);
    } else {
      // No session notes yet; create and open one
      this.openSessionNote();
    }
  }

  updateRibbon() {
    if (this.settings.showRibbonButton) {
      if (!this.ribbonEl) {
        this.ribbonEl = this.addRibbonIcon('dice', 'Toggle Session Notes', () => this.toggleSessionNotesVisibility());
      }
    } else {
      if (this.ribbonEl) {
        this.ribbonEl.remove();
        this.ribbonEl = undefined;
      }
    }
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {
    // Note: removing the beforeunload listener here would require keeping a handle to the bound function.
    if (this.ribbonEl) {
      this.ribbonEl.remove();
      this.ribbonEl = undefined;
    }
  }
}

class SNoteSettingTab extends PluginSettingTab {
  plugin: SNote;

  constructor(app: any, plugin: SNote) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Session Notes Settings' });

    new Setting(containerEl)
      .setName('Show ribbon button')
      .setDesc('Show a ribbon icon to toggle visibility of session notes in the workspace.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showRibbonButton)
          .onChange(async (value) => {
            this.plugin.settings.showRibbonButton = value;
            await this.plugin.saveSettings();
            this.plugin.updateRibbon();
          })
      );

    new Setting(containerEl)
      .setName('Shows Session Note on Startup')
      .setDesc('Automatically create and open a Session Note when Obsidian starts.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showSessionNoteOnStartup)
          .onChange(async (value) => {
            this.plugin.settings.showSessionNoteOnStartup = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
