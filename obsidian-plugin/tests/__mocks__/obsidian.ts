// Mock obsidian for Node.js test environment
// tsx requires this to be loaded via require hook
module.exports = {
  SettingTab: class SettingTab {},
  Setting: class Setting {
    setName() { return this; }
    setDesc() { return this; }
    addText() { return this; }
    addToggle() { return this; }
    addDropdown() { return this; }
    addButton() { return this; }
  },
  Notice: class Notice {},
  Plugin: class Plugin {},
  App: class App {},
};
