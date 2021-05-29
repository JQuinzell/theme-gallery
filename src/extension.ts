// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"

interface Theme {
  id?: string
  label: string
}

const themes: Theme[] = vscode.extensions.all
  .flatMap((ext) => ext.packageJSON?.contributes?.themes)
  .filter(Boolean)

const settings = vscode.workspace.getConfiguration()

async function changeTheme() {
  const themeIndex = Math.floor(Math.random() * Math.floor(themes.length))
  const randomTheme = themes[themeIndex].label
  await settings.update("workbench.colorTheme", randomTheme, true)
  // Display a message box to the user
  vscode.window.showInformationMessage(`Switched to theme: ${randomTheme}!`)
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "theme-gallery" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "theme-gallery.randomize",
    () => {
      changeTheme()
    }
  )

  context.subscriptions.push(disposable)

  setInterval(() => {
    changeTheme()
  }, 1000)
}

// this method is called when your extension is deactivated
export function deactivate() {}
