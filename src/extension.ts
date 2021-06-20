import * as vscode from "vscode"

interface Theme {
  id?: string
  label: string
  uiTheme: "vs" | "vs-dark"
}

const themePredicateMap = {
  All: () => true,
  Light: ({ uiTheme }: Theme) => uiTheme === "vs",
  Dark: ({ uiTheme }: Theme) => uiTheme === "vs-dark",
}

let themeChangeInterval: NodeJS.Timeout | null = null
let statusBarItem: vscode.StatusBarItem | null = null

function getThemes(): Theme[] {
  return vscode.extensions.all
    .flatMap((ext) => ext.packageJSON?.contributes?.themes)
    .filter(Boolean)
}

const userSettings = vscode.workspace.getConfiguration()

async function changeTheme() {
  const extensionConfig = getThemeConfig()
  const themeType =
    extensionConfig.get<"All" | "Light" | "Dark">("themeType") || "All"
  const themes = getThemes().filter(themePredicateMap[themeType])
  const themeIndex = Math.floor(Math.random() * Math.floor(themes.length))
  const randomTheme = themes[themeIndex].label
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
  const randomizeCommandId = "theme-gallery.randomize"
  context.subscriptions.push(
    vscode.commands.registerCommand(randomizeCommandId, () => {
      changeTheme()
    })
  )
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  )
  statusBarItem.text = userSettings.get<string>("workbench.colorTheme") || ""
  statusBarItem.command = randomizeCommandId
  statusBarItem.show()

  context.subscriptions.push(statusBarItem)
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("themeGallery")) {
        setThemeChangeInterval()
      }
    })
  )

  setThemeChangeInterval()
}

export function deactivate() {}
