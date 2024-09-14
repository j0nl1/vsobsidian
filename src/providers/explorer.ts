import { type ProviderResult, type TreeDataProvider, Uri, workspace, EventEmitter } from "vscode";
import fs from "node:fs";
import path from "node:path";
import { TreeItem } from "~/models";

export class ExplorerDataProvider implements TreeDataProvider<TreeItem> {
  onChangeData: EventEmitter<void> = new EventEmitter<void>();
  rootElement: TreeItem | undefined;
  constructor() {
    this.setup();
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem | undefined): ProviderResult<TreeItem[]> {
    if (!element) return this.rootElement?.children || [];
    return element.children || [];
  }

  createDirectoryTree(location: string): TreeItem | null {
    const stats = fs.statSync(location);

    const name = path.basename(location);
    const isDirectory = stats.isDirectory();
    const isMarkdown = path.extname(location) === ".md";

    if (!isDirectory && !isMarkdown) {
      return null;
    }

    return new TreeItem({
      name,
      type: isDirectory ? "folder" : "file",
      uri: Uri.file(location),
      children: isDirectory
        ? fs
            .readdirSync(location)
            .map((child) => this.createDirectoryTree(path.join(location, child)))
            .filter((child) => child !== null)
        : [],
    });
  }

  setup(): void {
    const settings = workspace.getConfiguration("vsobsidian");
    const vaultLocation = settings.get<string>("vaultLocation");
    const rootItem = vaultLocation ? this.createDirectoryTree(vaultLocation) : null;
    this.rootElement = rootItem ? rootItem : undefined;
  }

  refresh(): void {
    this.setup();
    this.onChangeData.fire();
  }
}
