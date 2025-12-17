import * as vscode from "vscode";
import { exec } from "child_process";
import * as path from "path";

/* -------------------- UTILS -------------------- */

function runGitCommand(command: string, cwd?: string) {
  const terminal = vscode.window.createTerminal("Git Assistant");
  terminal.show();
  terminal.sendText(command);
}

function getWorkspacePath(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

/* -------------------- TREE ITEM -------------------- */

class GitItem extends vscode.TreeItem {
  constructor(
    label: string,
    collapsible: vscode.TreeItemCollapsibleState,
    command?: vscode.Command
  ) {
    super(label, collapsible);
    this.command = command;
  }
}

/* -------------------- BRANCH TREE -------------------- */

class BranchProvider implements vscode.TreeDataProvider<GitItem> {
  getTreeItem(element: GitItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Promise<GitItem[]> {
    const cwd = getWorkspacePath();
    if (!cwd) return Promise.resolve([]);

    return new Promise((resolve) => {
      exec("git branch", { cwd }, (err, stdout) => {
        if (err) return resolve([]);
        const branches = stdout.split("\n").filter(Boolean);

        resolve(
          branches.map((b) => {
            const name = b.replace("*", "").trim();
            return new GitItem(
              name,
              vscode.TreeItemCollapsibleState.None,
              {
                command: "gitAssistant.checkout",
                title: "Checkout",
                arguments: [name],
              }
            );
          })
        );
      });
    });
  }
}

/* -------------------- FILE STATUS TREE -------------------- */

class FileStatusProvider implements vscode.TreeDataProvider<GitItem> {
  getTreeItem(element: GitItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Promise<GitItem[]> {
    const cwd = getWorkspacePath();
    if (!cwd) return Promise.resolve([]);

    return new Promise((resolve) => {
      exec("git status --short", { cwd }, (err, stdout) => {
        if (err) return resolve([]);
        const files = stdout.split("\n").filter(Boolean);

        resolve(
          files.map((f) => {
            const filePath = f.substring(3).trim();
            return new GitItem(
              filePath,
              vscode.TreeItemCollapsibleState.None,
              {
                command: "vscode.open",
                title: "Open File",
                arguments: [vscode.Uri.file(path.join(cwd, filePath))],
              }
            );
          })
        );
      });
    });
  }
}

/* -------------------- LOG TREE -------------------- */

class LogProvider implements vscode.TreeDataProvider<GitItem> {
  getTreeItem(element: GitItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Promise<GitItem[]> {
    const cwd = getWorkspacePath();
    if (!cwd) return Promise.resolve([]);

    return new Promise((resolve) => {
      exec("git log --oneline -5", { cwd }, (err, stdout) => {
        if (err) return resolve([]);
        const logs = stdout.split("\n").filter(Boolean);

        resolve(
          logs.map(
            (log) =>
              new GitItem(log, vscode.TreeItemCollapsibleState.None)
          )
        );
      });
    });
  }
}

/* -------------------- EXTENSION ACTIVATE -------------------- */

export function activate(context: vscode.ExtensionContext) {
  const cwd = getWorkspacePath();

  /* ---------- REGISTER TREE VIEWS ---------- */

  vscode.window.registerTreeDataProvider(
    "gitTreeView",
    new BranchProvider()
  );

  vscode.window.registerTreeDataProvider(
    "gitFileTreeView",
    new FileStatusProvider()
  );

  vscode.window.registerTreeDataProvider(
    "gitLogView",
    new LogProvider()
  );

  /* ---------- EXISTING COMMANDS (KEPT) ---------- */

  context.subscriptions.push(
    vscode.commands.registerCommand("gitAssistant.status", () =>
      runGitCommand("git status", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.add", () =>
      runGitCommand("git add .", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.commit", async () => {
      const msg = await vscode.window.showInputBox({
        prompt: "Commit message",
      });
      if (msg) runGitCommand(`git commit -m "${msg}"`, cwd);
    }),

    vscode.commands.registerCommand("gitAssistant.push", () =>
      runGitCommand("git push", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.pull", () =>
      runGitCommand("git pull", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.fetch", () =>
      runGitCommand("git fetch", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.checkout", async (branch) => {
      if (!branch) {
        branch = await vscode.window.showInputBox({
          prompt: "Branch name",
        });
      }
      if (branch) runGitCommand(`git checkout ${branch}`, cwd);
    }),

    vscode.commands.registerCommand("gitAssistant.listBranches", () =>
      runGitCommand("git branch", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.log", () =>
      runGitCommand("git log --oneline --graph", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.stash", () =>
      runGitCommand("git stash", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.reset", () =>
      runGitCommand("git reset --hard", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.merge", async () => {
      const branch = await vscode.window.showInputBox({
        prompt: "Merge branch name",
      });
      if (branch) runGitCommand(`git merge ${branch}`, cwd);
    }),

    vscode.commands.registerCommand("gitAssistant.addRemote", async () => {
      const url = await vscode.window.showInputBox({
        prompt: "Remote URL",
      });
      if (url) runGitCommand(`git remote add origin ${url}`, cwd);
    }),

    vscode.commands.registerCommand("gitAssistant.removeRemote", () =>
      runGitCommand("git remote remove origin", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.setRemoteUrl", async () => {
      const url = await vscode.window.showInputBox({
        prompt: "New remote URL",
      });
      if (url) runGitCommand(`git remote set-url origin ${url}`, cwd);
    }),

    vscode.commands.registerCommand("gitAssistant.listRemote", () =>
      runGitCommand("git remote -v", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.pushUpstream", () =>
      runGitCommand("git push -u origin HEAD", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.fetchAll", () =>
      runGitCommand("git fetch --all", cwd)
    ),

    /* ---------- NEW COMMANDS (ADDED) ---------- */

    vscode.commands.registerCommand("gitAssistant.quickCommit", async () => {
      const msg = await vscode.window.showInputBox({
        prompt: "Quick commit message",
      });
      if (msg) {
        runGitCommand("git add .", cwd);
        runGitCommand(`git commit -m "${msg}"`, cwd);
      }
    }),

    vscode.commands.registerCommand("gitAssistant.autoPull", () =>
      runGitCommand("git stash && git pull && git stash pop", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.clean", () =>
      runGitCommand("git clean -fd", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.openGithub", () =>
      runGitCommand("git remote -v", cwd)
    ),

    vscode.commands.registerCommand("gitAssistant.copyRepoUrl", () =>
      runGitCommand("git config --get remote.origin.url", cwd)
    )
  );
}

export function deactivate() {}
