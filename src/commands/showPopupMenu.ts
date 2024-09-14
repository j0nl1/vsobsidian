import { type QuickPickItem, window } from "vscode";
import type { TreeItem } from "~/models";

export function showPopupMenuCommand(treeItem: TreeItem) {
  const options: QuickPickItem[] = [
    { label: "Open Item", description: "Open the selected item" },
    { label: "Delete Item", description: "Delete the selected item" },
  ];

  const quickPick = window.createQuickPick();
  quickPick.items = options;
  quickPick.placeholder = "Select an action for the item";

  quickPick.onDidChangeSelection((selection) => {
    const [selected] = selection;
    if (selected) {
      if (selected.label === "Open Item") {
        window.showInformationMessage(`You selected to open: ${treeItem.label}`);
      } else if (selected.label === "Delete Item") {
        window.showInformationMessage(`You selected to delete: ${treeItem.label}`);
      }
    }
    quickPick.hide();
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}
