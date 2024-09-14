import { TreeItem as VSTreeItem, TreeItemCollapsibleState, type Uri } from "vscode";

export const ItemType = {
  Folder: "folder",
  File: "file",
} as const;

export type ItemTypes = (typeof ItemType)[keyof typeof ItemType];

export class TreeItem extends VSTreeItem {
  children: TreeItem[];

  constructor(item: { name: string; type: string; uri: Uri; children: TreeItem[] }) {
    super(
      item.name,
      item.type === "folder" ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
    );
    this.children = item.children;
    this.resourceUri = item.uri;
    this.contextValue = item.type;
    if (item.type === "file") {
      this.command = {
        title: "Open",
        command: "vscode.open",
        arguments: [item.uri],
      };
    }
  }
}
