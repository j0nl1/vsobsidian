import { window, workspace } from "vscode";
import path from "node:path";

export async function setupVaultCommand() {
  const response = await window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select",
  });

  if (!response) return;

  const [selectedFolder] = response;
  const vaultLocation = path.normalize(selectedFolder.fsPath);
  const test = workspace.getConfiguration("vsobsidian");
  await test.update("vaultLocation", vaultLocation, true);

  window.showInformationMessage(`Vault location set to: ${vaultLocation}`);
}
