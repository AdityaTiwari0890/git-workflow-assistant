import * as vscode from 'vscode';

function runGitCommand(command: string) {
	const terminal = vscode.window.createTerminal('Git Assistant');
	terminal.show();
	terminal.sendText(command);
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Git Workflow Assistant ACTIVATED');

	context.subscriptions.push(
		// Basic commands
		vscode.commands.registerCommand('gitAssistant.status', () => runGitCommand('git status')),
		vscode.commands.registerCommand('gitAssistant.add', () => runGitCommand('git add .')),
		vscode.commands.registerCommand('gitAssistant.commit', async () => {
			const msg = await vscode.window.showInputBox({ placeHolder: 'Enter commit message' });
			if (msg) runGitCommand(`git commit -m "${msg}"`);
		}),
		vscode.commands.registerCommand('gitAssistant.push', () => runGitCommand('git push')),

		// Extended commands
		vscode.commands.registerCommand('gitAssistant.pull', () => runGitCommand('git pull')),
		vscode.commands.registerCommand('gitAssistant.fetch', () => runGitCommand('git fetch')),
		vscode.commands.registerCommand('gitAssistant.checkout', async () => {
			const branch = await vscode.window.showInputBox({ placeHolder: 'Enter branch name' });
			if (branch) runGitCommand(`git checkout ${branch}`);
		}),
		vscode.commands.registerCommand('gitAssistant.listBranches', () => runGitCommand('git branch')),
		vscode.commands.registerCommand('gitAssistant.log', () => runGitCommand('git log --oneline --graph --all')),
		vscode.commands.registerCommand('gitAssistant.stash', () => runGitCommand('git stash')),
		vscode.commands.registerCommand('gitAssistant.reset', async () => {
			const commit = await vscode.window.showInputBox({ placeHolder: 'Enter commit hash or HEAD~1' });
			if (commit) runGitCommand(`git reset --hard ${commit}`);
		}),
		vscode.commands.registerCommand('gitAssistant.merge', async () => {
			const branch = await vscode.window.showInputBox({ placeHolder: 'Enter branch to merge' });
			if (branch) runGitCommand(`git merge ${branch}`);
		}),

		// Remote commands
		vscode.commands.registerCommand('gitAssistant.addRemote', async () => {
			const url = await vscode.window.showInputBox({ placeHolder: 'Enter remote URL' });
			if (url) runGitCommand(`git remote add origin ${url}`);
		}),
		vscode.commands.registerCommand('gitAssistant.removeRemote', async () => {
			const name = await vscode.window.showInputBox({ placeHolder: 'Enter remote name to remove' });
			if (name) runGitCommand(`git remote remove ${name}`);
		}),
		vscode.commands.registerCommand('gitAssistant.setRemoteUrl', async () => {
			const name = await vscode.window.showInputBox({ placeHolder: 'Enter remote name' });
			const url = await vscode.window.showInputBox({ placeHolder: 'Enter new URL' });
			if (name && url) runGitCommand(`git remote set-url ${name} ${url}`);
		}),
		vscode.commands.registerCommand('gitAssistant.listRemote', () => runGitCommand('git remote -v')),
		vscode.commands.registerCommand('gitAssistant.pushUpstream', async () => {
			const branch = await vscode.window.showInputBox({ placeHolder: 'Enter branch name' });
			if (branch) runGitCommand(`git push -u origin ${branch}`);
		}),
		vscode.commands.registerCommand('gitAssistant.fetchAll', () => runGitCommand('git fetch --all'))
	);
}

export function deactivate() {}
