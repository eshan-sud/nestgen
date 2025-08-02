# NestGen

Visualize and export the file/directory structure of your current workspace in one click.

## Features

- 📁 **Generate directory tree** of any workspace or folder
- 📝 **Export to `file-structure.txt`** at the root level
- 📋 **Copy tree to clipboard** with one command
- ⚙️ **Configurable max depth** via settings
- 📂 **Ignores `.gitignore` rules**
- 🔠 **Alphabetically sorts folders/files**
- 🖱️ **Status bar button** for quick access

## Requirements

No external dependencies. Works out-of-the-box with VS Code `1.102.0 and above`.

## Extension Settings

This extension contributes the following setting:

- `nestgen.maxDepth`: _(number)_ Maximum depth for tree generation. Default is `10`.

## Known Issues

- Only works in open folders/workspaces (not single files).
- Clipboard copy might not work in some remote/SSH VS Code contexts.

## Release Notes

### 0.0.1

- Initial release with support for file tree generation, `.gitignore` parsing, config, clipboard copy, and file export.

---

## Contributing

Suggestions, issues, and contributions are welcome!

## License

[MIT](./LICENSE)

---

## For VS Code Marketplace

Search for `NestGen`.

---

**Enjoy!**
