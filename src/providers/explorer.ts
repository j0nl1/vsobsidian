import {
  type DataTransfer,
  type ProviderResult,
  type TreeDataProvider,
  Uri,
  window,
  workspace,
  EventEmitter,
  type TreeDragAndDropController,
  type Event,
  DataTransferItem,
} from "vscode";
import fs from "node:fs";
import path from "node:path";
import { TreeItem, ItemType, type ItemTypes } from "~/models";

export class ExplorerDataProvider
  implements TreeDataProvider<TreeItem>, TreeDragAndDropController<TreeItem>
{
  dragMimeTypes = ["application/vnd.code.tree.TreeItem"];
  dropMimeTypes = ["application/vnd.code.tree.TreeItem"];
  private _onDidChangeTreeData: EventEmitter<void> = new EventEmitter<void>();
  readonly onDidChangeTreeData: Event<void> = this._onDidChangeTreeData.event;

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

  handleDrag(source: readonly TreeItem[], dataTransfer: DataTransfer): void {
    dataTransfer.set("application/vnd.code.tree.ExplorerView", new DataTransferItem(source));
  }

  handleDrop(target: TreeItem | undefined, dataTransfer: DataTransfer): void {
    if (target && target.contextValue === ItemType.File) return;
    const transferItem = dataTransfer.get("application/vnd.code.tree.ExplorerView");
    if (!transferItem) return;
    const uris = transferItem.value.map(({ resourceUri }: TreeItem) => resourceUri);
    const destinationDir = target?.resourceUri?.fsPath || this.rootElement?.resourceUri?.fsPath;

    if (!destinationDir) return;

    for (const uri of uris) {
      const sourcePath = uri.fsPath;
      const fileName = path.basename(sourcePath);
      const destinationPath = path.join(destinationDir, fileName);

      fs.renameSync(sourcePath, destinationPath);
    }

    this.refresh();
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
      type: isDirectory ? ItemType.Folder : ItemType.File,
      uri: Uri.file(location),
      children: isDirectory
        ? fs
            .readdirSync(location)
            .map((child) => this.createDirectoryTree(path.join(location, child)))
            .filter((child) => child !== null)
        : [],
    });
  }

  async createElement(target: TreeItem | undefined, type: ItemTypes): Promise<void> {
    const targetDir = target?.resourceUri?.fsPath || this.rootElement?.resourceUri?.fsPath;
    if (!targetDir) return;

    const isFile = type === ItemType.File;

    const elementName = await window.showInputBox({
      prompt: `Enter the ${type} name`,
      placeHolder: isFile ? "example.md" : "New Folder",
      validateInput: (input) => (input.trim() ? undefined : `${type} name cannot be empty`),
    });

    if (!elementName) return;

    if (isFile) {
      const filePath = path.join(targetDir, elementName);
      fs.writeFileSync(filePath, "");
    } else {
      const folderPath = path.join(targetDir, elementName);
      fs.mkdirSync(folderPath);
    }

    this.refresh();
  }

  async renameElement(target: TreeItem | undefined): Promise<void> {
    if (!target) return;
    const oldPath = target.resourceUri?.fsPath;
    if (!oldPath) return;

    const newPath = await window.showInputBox({
      prompt: "Enter the new name",
      value: path.basename(oldPath),
      validateInput: (input) => (input.trim() ? undefined : "Name cannot be empty"),
    });

    if (!newPath) return;

    const parentPath = path.dirname(oldPath);
    const newFullPath = path.join(parentPath, newPath);

    fs.renameSync(oldPath, newFullPath);

    this.refresh();
  }

  async deleteElement(target: TreeItem | undefined): Promise<void> {
    if (!target) return;
    const elementPath = target.resourceUri?.fsPath;
    if (!elementPath) return;

    const stats = fs.statSync(elementPath);
    if (stats.isFile()) fs.unlinkSync(elementPath);
    else fs.rmdirSync(elementPath, { recursive: true });

    this.refresh();
  }

  setup(): void {
    const settings = workspace.getConfiguration("vsobsidian");
    const vaultLocation = settings.get<string>("vaultLocation");
    const rootItem = vaultLocation ? this.createDirectoryTree(vaultLocation) : null;
    this.rootElement = rootItem ? rootItem : undefined;
  }

  refresh(): void {
    this.setup();
    this._onDidChangeTreeData.fire();
  }
}
