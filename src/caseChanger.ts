"use strict";

import * as vscode from "vscode";
import * as changeCaseFunctions from "change-case";

export function changeCase() {
  if (vscode.window.activeTextEditor == null) return;
  const { document, selections } = vscode.window.activeTextEditor;

  // Get language specific or general configuration
  var documentLanguage = document.languageId;
  const languageCases = vscode.workspace.getConfiguration(`[${documentLanguage}]`)["jotaBe.caseChanger"];
  const generalCases = vscode.workspace.getConfiguration("jotaBe").caseChanger;
  const caseNames : string[] = languageCases ?? generalCases ?? [];

  // Build array of casing functions from the configuration
  const configuredCaseFunctions = caseNames
    .map<any>((name) => changeCaseFunctions[name as keyof typeof changeCaseFunctions])
    .filter((func) => func != null && typeof func === 'function');
    
  if (configuredCaseFunctions.length == 0) return;

  // Change editor selections to next case
  vscode.window.activeTextEditor.edit((editBuilder) => {
    selections.forEach((selection) => {
      if (!selection.isSingleLine) {
        return;
      }
      const range = selection.isEmpty
        ? document.getWordRangeAtPosition(selection.active)
        : selection;
      if (range == null) {
        return;
      }
      const text = document.getText(range);
      var nextCaseText = getNextCaseOfText(text, configuredCaseFunctions)
      editBuilder.replace(range, nextCaseText);
    });
  });
}

function getNextCaseOfText(
  text: string,
  caseFunctions: Array<(input: string) => string>): string {
    let nextCased: string | undefined;
    for (let index = caseFunctions.length - 1; index >= 0; index--) {
      const caseFunc = caseFunctions[index];

      const currCased = caseFunc(text);
      if (text === currCased) {
        return nextCased ?? caseFunctions[0](text);
      }
      nextCased = currCased;
    }
  
  return nextCased ?? caseFunctions[0](text);
}
