import { commands, type ExtensionContext, window, workspace } from "vscode";
import { ExplorerDataProvider } from "./providers/explorer";
import { setupVaultCommand, showPopupMenuCommand } from "./commands";

const EXTENSION_ID = "vsobsidian";

const explorerDataProvider = new ExplorerDataProvider();

export function activate(context: ExtensionContext) {
  /* -------------------------------------------------------------------------- */
  /*                                    Views                                   */
  /* -------------------------------------------------------------------------- */

  context.subscriptions.push(
    window.createTreeView("explorer-view", {
      treeDataProvider: explorerDataProvider,
    }),
  );

  /* -------------------------------------------------------------------------- */
  /*                                  Commands                                  */
  /* -------------------------------------------------------------------------- */

  context.subscriptions.push(
    commands.registerCommand("vsobsidian.refreshExplorer", () => explorerDataProvider.refresh()),
  );
  context.subscriptions.push(commands.registerCommand("vsobsidian.setupVault", setupVaultCommand));
  context.subscriptions.push(
    commands.registerCommand("vsobsidian.showPopupMenu", showPopupMenuCommand),
  );

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
