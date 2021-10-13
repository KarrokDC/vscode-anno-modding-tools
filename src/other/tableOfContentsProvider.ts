/*
based on https://github.com/microsoft/vscode/blob/main/extensions/markdown-language-features/src/tableOfContentsProvider.ts
- TocEntry, SkinnyTextLine, SkinnyTextDocument
- TableOfContentsProvider skeleton
- // Get full range of section
Licensed under the MIT License. Copyright (c) Microsoft Corporation. All rights reserved.
*/

import * as vscode from 'vscode';

export interface TocEntry {
	readonly text: string;
	readonly detail: string;
	readonly level: number;
	readonly line: number;
	readonly location: vscode.Location;
	readonly symbol: vscode.SymbolKind;
}

export interface SkinnyTextLine {
	text: string;
}

export interface SkinnyTextDocument {
	readonly uri: vscode.Uri;
	readonly version: number;
	readonly lineCount: number;

	lineAt(line: number): SkinnyTextLine;
	getText(): string;
}

class Section {
	name?: string;
	type?: string;
	tagName: string;
	startLine: number;
	fileName?: string;
	diffName?: string;
	startChar: number;
	sequenceId?: string;

	constructor(tagName: string, startLine: number, startChar: number) {
		this.tagName = tagName;
		this.startLine = startLine;
		this.startChar = startChar;
	}
}

export class TableOfContentsProvider {
	private toc?: TocEntry[];

	public constructor(
		private document: SkinnyTextDocument
	) { }

	public async getToc(): Promise<TocEntry[]> {
		if (!this.toc) {
			try {
				this.toc = await this.buildToc(this.document);
			} catch (e) {
				this.toc = [];
			}
		}
		return this.toc;
	}

	private async buildToc(document: SkinnyTextDocument): Promise<TocEntry[]> {
		const toc: TocEntry[] = [];

		const relevantSections: { [index: string]: any } = { 
			/* eslint-disable @typescript-eslint/naming-convention */
			'Files': {},
			'Models': {},
			'PropContainers': {}, 
			'Decals': {}, 
			'Sequences': {},
			'Particles': {},
			'Lights': {},
			'Config': {
				'ConfigTypes': [ 'FILE', 'MODEL', 'PROPCONTAINER', 'PROP', 'MATERIAL', 'SEQUENCE', 'PARTICLE' ]
			},
			/* fc */
			'DummyRoot': {},
			'FeedbackDefinition': {},
			'ActorNames': {},
			'i': {
				parent: [ 'Groups', 'FeedbackConfigs' ]
			},
			/* ifo */
			'BoundingBox': {},
			'MeshBoundingBox': {},
			'IntersectBox': {},
			'BuildBlocker': {},
			'Sequence': {},
			'FeedbackBlocker': {},
			'Dummy': {}
			/* eslint-enable @typescript-eslint/naming-convention */
		};

		const symbolMap: { [index: string]: vscode.SymbolKind } = {
			/* eslint-disable @typescript-eslint/naming-convention */
			'Files': vscode.SymbolKind.Class,
			'FILE': vscode.SymbolKind.Field,
			'Models': vscode.SymbolKind.Class,
			'MODEL': vscode.SymbolKind.Field,
			'PROP': vscode.SymbolKind.Field,
			'PROPCONTAINER': vscode.SymbolKind.Namespace,
			'PropContainers': vscode.SymbolKind.Class,
			'Decals': vscode.SymbolKind.Class,
			'Sequences': vscode.SymbolKind.Class,
			'MATERIAL': vscode.SymbolKind.Constructor,
			'SEQUENCE': vscode.SymbolKind.Event,
			'Particles': vscode.SymbolKind.Class,
			'PARTICLE': vscode.SymbolKind.Field,
			'Lights': vscode.SymbolKind.Class,
			'LIGHT': vscode.SymbolKind.Field,
			/* fc */
			'DummyRoot': vscode.SymbolKind.Class,
			'FeedbackDefinition': vscode.SymbolKind.Class,
			'ActorNames': vscode.SymbolKind.String,
			'i': vscode.SymbolKind.Field,
			/* ifo */
			'BoundingBox': vscode.SymbolKind.Field,
			'MeshBoundingBox': vscode.SymbolKind.Field,
			'IntersectBox': vscode.SymbolKind.Field,
			'FeedbackBlocker': vscode.SymbolKind.Field,
			'BuildBlocker': vscode.SymbolKind.Field,
			'Sequence': vscode.SymbolKind.Event
			/* eslint-enable @typescript-eslint/naming-convention */
		};

		let tagStack: Section[] = [];
		let tagStackTop: Section | null = null;
		let relevantDepth = 0;
		let lastValue: string = '';

    for (let line = 0; line < document.lineCount; line++) {
      const tokens = document.lineAt(line).text.match(/(<[^>]+>)|[^<>]+/g);
      if (tokens) {
				let charPos = 0;
        for (const token of tokens) {
					const tagName = token.replace(/[<>\/]/g, '');

					if (token.startsWith('</')) {
						// closing

						if (tagName !== tagStackTop?.tagName) {
							console.warn('Invalid ' + token + ' at line ' + (line+1).toString() + '. Expecting </' + tagStackTop?.tagName + '>');
							continue;
						}

						const tocRelevant = relevantSections[tagStackTop.tagName];
						const hasRightConfigType = (!tocRelevant?.ConfigTypes || tocRelevant.ConfigTypes.indexOf(tagStackTop.type) !== -1);
						const hasRightParent = (!tocRelevant?.parent || (tagStack.length >= 2 && tocRelevant.parent.indexOf(tagStack[tagStack.length - 2].tagName) !== -1));
						if (tocRelevant && hasRightConfigType && hasRightParent) {
							toc.push({
								text: ((tagStackTop.fileName || tagStackTop.diffName) ? tagStackTop.name : false) || tagStackTop.type || tagStackTop.tagName,
								detail: tagStackTop.fileName || tagStackTop.diffName || tagStackTop.name || tagStackTop.sequenceId || '',
								level: tagStack.length - 1,
								line: tagStackTop.startLine,
								location: new vscode.Location(document.uri,
									new vscode.Range(tagStackTop.startLine, tagStackTop.startChar, line, tagStackTop.startChar + tagStackTop.tagName.length + 2)),
								symbol: symbolMap[tagStackTop.type || tagStackTop.tagName] || vscode.SymbolKind.String
							});
							relevantDepth --;
						}

						if (tagStack.length > 0) {
							tagStack.pop();
							tagStackTop = tagStack[tagStack.length - 1];
						}
						else {
							tagStackTop = null;
						}

						if (tagName === 'ConfigType' && tagStackTop) {
							// we just closed ConfigType, assign type to parent element (Config)
							tagStackTop.type = lastValue;
						}
						else if (tagName === 'Name' && tagStackTop) {
							// we just closed Name, assign name to parent
							tagStackTop.name = lastValue;
						}
						else if (tagName === 'FileName' && tagStackTop) {
							// we just closed Name, assign name to parent
							tagStackTop.fileName = lastValue.split(/[\\\/]/).pop();
						}
						else if (tagName === 'cModelDiffTex' && tagStackTop) {
							tagStackTop.diffName = lastValue.split(/[\\\/]/).pop();
						}
						else if ((tagName === 'SequenceID' || tagName === 'Id') && tagStackTop) {
							tagStackTop.sequenceId = lastValue;
						}
					}
					else if (token.startsWith('<')) {
						// opening
						tagStack.push(new Section(tagName, line, charPos));
						tagStackTop = tagStack[tagStack.length - 1];
						if (relevantSections[tagStackTop.tagName] !== undefined) {
							relevantDepth ++;
						}
						lastValue = '';
					}
					else {
						// value
						lastValue = token;
					}

					charPos += token.length;
        }
      }
		}

		// sort by start
		toc.sort((a, b) => {
			const compare = a.line - b.line;
			return compare || (a.location.range.start.character - b.location.range.start.character);
		});

		// Get full range of section
		return toc.map((entry, startIndex): TocEntry => {
			let end: number | undefined = undefined;
			for (let i = startIndex + 1; i < toc.length; ++i) {
				if (toc[i].level <= entry.level) {
					end = toc[i].line - 1;
					break;
				}
			}
			const endLine = end ?? document.lineCount - 1;
			return {
				...entry,
				location: new vscode.Location(document.uri,
					new vscode.Range(
						entry.location.range.start,
						new vscode.Position(endLine, document.lineAt(endLine).text.length)))
			};
		});
	}
}