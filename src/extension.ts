import * as vscode from "vscode"

interface Theme {
  id?: string
  label: string
  uiTheme: "vs" | "vs-dark"
}

interface ThemePredicateMap {
  [type: string]: (theme: Theme) => boolean
}

const themePredicateMap = {
  All: () => true,
  Light: ({ uiTheme }: Theme) => uiTheme === "vs",
  Dark: ({ uiTheme }: Theme) => uiTheme === "vs-dark",
}

let themeChangeInterval: NodeJS.Timeout | null = null
let statusBarItem: vscode.StatusBarItem | null = null

const themes: Theme[] = vscode.extensions.all
  .flatMap((ext) => ext.packageJSON?.contributes?.themes)
  .filter(Boolean)

const userSettings = vscode.workspace.getConfiguration()

async function changeTheme() {
  const extensionConfig = getThemeConfig()
  const themeType =
    extensionConfig.get<"All" | "Light" | "Dark">("themeType") || "All"
  const filteredThemes = themes.filter(themePredicateMap[themeType])
  const themeIndex = Math.floor(
    Math.random() * Math.floor(filteredThemes.length)
  )
  const randomTheme = filteredThemes[themeIndex].label
  await userSettings.update("workbench.colorTheme", randomTheme, true)
  statusBarItem!.text = randomTheme || ""
}

function setThemeChangeInterval() {
  if (themeChangeInterval) {
    clearInterval(themeChangeInterval)
  }
  const extensionConfig = getThemeConfig()
  const useInterval = extensionConfig.get<boolean>("interval")
  const intervalLength = extensionConfig.get<number>("intervalLength")

  if (useInterval && intervalLength) {
    const intervalLengthMs = intervalLength * 1000 * 60
    themeChangeInterval = setInterval(() => {
      changeTheme()
    }, intervalLengthMs)
  }
}
function getThemeConfig() {
  return vscode.workspace.getConfiguration("themeGallery")
}

export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  )
  statusBarItem.text = userSettings.get<string>("workbench.colorTheme") || ""
  statusBarItem.show()

  context.subscriptions.push(statusBarItem)
  context.subscriptions.push(
    vscode.commands.registerCommand("theme-gallery.randomize", () => {
      changeTheme()
    })
  )
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("themeGallery")) {
        setThemeChangeInterval()
      }
    })
  )

  setThemeChangeInterval()

  context.subscriptions.push(
    vscode.commands.registerCommand("theme-gallery.gallery", () => {
      // Create and show panel
      const panel = vscode.window.createWebviewPanel(
        "themeGallery",
        "Theme Gallry",
        vscode.ViewColumn.One,
        {
          // Enable javascript in the webview
          enableScripts: true,

          // And restrict the webview to only loading content from our extension's `media` directory.
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, "out/compiled"),
          ],
        }
      )

      // And set its HTML content
      panel.webview.html = getWebviewContent(
        panel.webview,
        vscode.Uri.joinPath(context.extensionUri, "out/compiled", "main.js")
      )

      panel.webview.postMessage({ themes })

      // Cleanup when webview closes
      // panel.onDidDispose(() => {}, null, context.subscriptions)
    })
  )
}

export function deactivate() {}

function getWebviewContent(webview: vscode.Webview, scriptUri: vscode.Uri) {
  const scriptSrc = webview.asWebviewUri(scriptUri)
  console.log(webview.cspSource)
  console.log(scriptSrc)
  const nonce =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".slice(
      0,
      32
    )
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Theme Gallery</title>
    </head>
    <body>
    </body>
    <script src="${scriptSrc}" nonce="${nonce}"></script>
</html>`
}
