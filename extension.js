// extension.js

const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const ignore = require("ignore");

function getConfiguration() {
  return vscode.workspace.getConfiguration("fileStructureGenerator");
}

/**
 * Reads .gitignore and returns an ignore instance
 */
function getIgnoreInstance(rootPath) {
  const ig = ignore();
  const gitignorePath = path.join(rootPath, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    ig.add(gitignoreContent.split(/\r?\n/));
  }
  return ig;
}

/**
 * Recursively generates a tree view as a string
 */
function generateTree(
  dirPath,
  ig,
  prefix = "",
  depth = 0,
  maxDepth,
  rootPath = dirPath
) {
  if (depth > maxDepth) return "";
  const allItems = fs.readdirSync(dirPath, { withFileTypes: true });
  const entries = allItems
    .filter((item) => {
      const relative = path.relative(rootPath, path.join(dirPath, item.name));
      return !ig.ignores(relative);
    })
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });
  const lastIndex = entries.length - 1;
  let tree = "";
  entries.forEach((entry, index) => {
    const isLast = index === lastIndex;
    const pointer = isLast ? "└── " : "├── ";
    tree += `${prefix}${pointer}${entry.name}\n`;
    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      tree += generateTree(
        path.join(dirPath, entry.name),
        ig,
        newPrefix,
        depth + 1,
        maxDepth,
        rootPath
      );
    }
  });
  return tree;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const disposable = vscode.commands.registerCommand(
    "nestgen.generateTree",
    async function () {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage("No workspace folder is open.");
        return;
      }
      const rootPath = folders[0].uri.fsPath;
      const config = getConfiguration();
      const maxDepth = config.get("maxDepth", 10);
      const ig = getIgnoreInstance(rootPath);
      const rootFolderName = path.basename(rootPath);
      let tree = `${rootFolderName}/\n`;
      tree += generateTree(rootPath, ig, "", 0, maxDepth, rootPath);
      const filePath = path.join(rootPath, "file-structure.txt");
      fs.writeFile(filePath, tree, "utf8", async (err) => {
        if (err) {
          vscode.window.showErrorMessage(
            `Failed to write file-structure.txt: ${err.message}`
          );
          return;
        }
        try {
          const doc = await vscode.workspace.openTextDocument(filePath);
          await vscode.window.showTextDocument(doc);
          vscode.window.showInformationMessage(
            "File structure saved to file-structure.txt"
          );
        } catch (err) {
          vscode.window.showErrorMessage(
            `File written but could not open it: ${err.message}`
          );
        }
      });
      try {
        await vscode.env.clipboard.writeText(tree);
        vscode.window.showInformationMessage(
          "File structure copied to clipboard."
        );
      } catch (err) {
        vscode.window.showWarningMessage(
          `Failed to copy file structure to clipboard: ${err.message}`
        );
      }
    }
  );
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "nestgen.generateTree";
  statusBarItem.text = "$(list-tree) NestGen";
  statusBarItem.tooltip = "Generate File Structure Tree";
  statusBarItem.show();
  context.subscriptions.push(disposable, statusBarItem);
}

/**
 * Called when the extension is deactivated
 */
function deactivate() {
  console.log("File Structure Generator extension deactivated.");
}

module.exports = {
  activate,
  deactivate,
};
