import * as vscode from 'vscode';
import * as path from 'path';

import * as rdp from '../other/rdp';

export class RdpConverter {
	public static register(context: vscode.ExtensionContext): vscode.Disposable[] {
    const disposable = [
      vscode.commands.registerCommand('anno-modding-tools.rdpToSimplified', async (fileUri) => {
        if (fileUri) {
          await rdp.rdpToXml(fileUri.fsPath, path.dirname(fileUri.fsPath), true);
        }
      }),
      vscode.commands.registerCommand('anno-modding-tools.rdpToXml', async (fileUri) => {
        if (fileUri) {
          await rdp.rdpToXml(fileUri.fsPath, path.dirname(fileUri.fsPath), false);
        }
      }),
      vscode.commands.registerCommand('anno-modding-tools.xmlToRdp', async (fileUri) => {
        if (fileUri) {
          await rdp.xmlToRdp(fileUri.fsPath, path.dirname(fileUri.fsPath));
        }
      })
    ];

    return disposable;
	}
}