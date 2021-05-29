// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"

interface Theme {
  id?: string
  label: string
}

let themeChangeInterval: NodeJS.Timeout | null = null

const themes: Theme[] = vscode.extensions.all
  .flatMap((ext) => ext.packageJSON?.contributes?.themes)
  .filter(Boolean)

const userSettings = vscode.workspace.getConfiguration()
async function changeTheme() {
  const themeIndex = Math.floor(Math.random() * Math.floor(themes.length))
  const randomTheme = themes[themeIndex].label
  await userSettings.update("workbench.colorTheme", randomTheme, true)
  // Display a message box to the user
  vscode.window.showInformationMessage(`Switched to theme: ${randomTheme}!`)
}

function setThemeChangeInterval() {
  if (themeChangeInterval) {
    clearInterval(themeChangeInterval)
  }
  const extensionConfig = vscode.workspace.getConfiguration("themeGallery")
  const useInterval = extensionConfig.get<boolean>("interval")
  const intervalLength = extensionConfig.get<number>("intervalLength")

  console.log({ useInterval, intervalLength })
  if (useInterval && intervalLength) {
    const intervalLengthMs = intervalLength * 1000 * 60
    console.log({ intervalLengthMs })
    themeChangeInterval = setInterval(() => {
      changeTheme()
    }, intervalLengthMs)
  }
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

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("themeGallery")) {
      console.log("Resetting interval")
      setThemeChangeInterval()
    }
  })

  setThemeChangeInterval()
}

// this method is called when your extension is deactivated
export function deactivate() {}
