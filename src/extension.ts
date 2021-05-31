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

  vscode.window.showInformationMessage(`Switched to theme: ${randomTheme}!`)
}

function setThemeChangeInterval() {
  if (themeChangeInterval) {
    clearInterval(themeChangeInterval)
  }
  const extensionConfig = vscode.workspace.getConfiguration("themeGallery")
  const useInterval = extensionConfig.get<boolean>("interval")
  const intervalLength = extensionConfig.get<number>("intervalLength")

  if (useInterval && intervalLength) {
    const intervalLengthMs = intervalLength * 1000 * 60
    themeChangeInterval = setInterval(() => {
      changeTheme()
    }, intervalLengthMs)
  }
}
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "theme-gallery.randomize",
    () => {
      changeTheme()
    }
  )

  context.subscriptions.push(disposable)

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("themeGallery")) {
      setThemeChangeInterval()
    }
  })

  setThemeChangeInterval()

  context.subscriptions.push(
    vscode.commands.registerCommand("theme-gallery.gallery", () => {
      // Create and show panel
      const panel = vscode.window.createWebviewPanel(
        "themeGallery",
        "Theme Gallry",
        vscode.ViewColumn.One,
        {}
      )

      // And set its HTML content
      panel.webview.html = getWebviewContent()

      // Cleanup when webview closes
      // panel.onDidDispose(() => {}, null, context.subscriptions)
    })
  )
}

export function deactivate() {}

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Theme Gallery</title>
</head>
<body>
    <h1>Theme Gallery</h1>
</body>
</html>`
}
