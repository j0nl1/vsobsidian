import { commands, type ExtensionContext, window, workspace } from "vscode";
import { ExplorerDataProvider } from "./providers/explorer";
import { setupVaultCommand } from "./commands";
import type { TreeItem } from "./models";

const EXTENSION_ID = "vsobsidian";

const explorerDataProvider = new ExplorerDataProvider();

export function activate(context: ExtensionContext) {
  /* -------------------------------------------------------------------------- */
  /*                                    Views                                   */
  /* -------------------------------------------------------------------------- */

  context.subscriptions.push(
    window.createTreeView("ExplorerView", {
      treeDataProvider: explorerDataProvider,
      canSelectMany: true,
      dragAndDropController: explorerDataProvider,
    }),
  );

  /* -------------------------------------------------------------------------- */
  /*                                  Commands                                  */
  /* -------------------------------------------------------------------------- */

  context.subscriptions.push(
    commands.registerCommand("vsobsidian.refreshExplorer", () => explorerDataProvider.refresh()),
  );
  context.subscriptions.push(
    commands.registerCommand("vsobsidian.createFile", (target: TreeItem) =>
      explorerDataProvider.createElement(target, "file"),
    ),
  );
  context.subscriptions.push(
    commands.registerCommand("vsobsidian.createFolder", (target: TreeItem) =>
      explorerDataProvider.createElement(target, "folder"),
    ),
  );

  context.subscriptions.push(
    commands.registerCommand("vsobsidian.openInOS", (target: TreeItem) =>
      commands.executeCommand("revealFileInOS", target.resourceUri),
    ),
  );

  context.subscriptions.push(
    commands.registerCommand("vsobsidian.renameElement", (target: TreeItem) =>
      explorerDataProvider.renameElement(target),
    ),
  );

  context.subscriptions.push(
    commands.registerCommand("vsobsidian.deleteElement", (target: TreeItem) =>
      explorerDataProvider.deleteElement(target),
    ),
  );

  context.subscriptions.push(commands.registerCommand("vsobsidian.setupVault", setupVaultCommand));

  /* -------------------------------------------------------------------------- */
  /*                                   Events                                   */
  /* -------------------------------------------------------------------------- */

  workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(EXTENSION_ID)) {
      explorerDataProvider.refresh();
    }
  });
}

export function deactivate() {}
