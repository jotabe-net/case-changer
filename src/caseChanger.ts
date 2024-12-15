"use strict";

import * as vscode from "vscode";
import * as changeCaseFunctions from "change-case";

const textCases2 = [
  { label: "camelCase", description: "thisIsACamelCaseExample" },
  { label: "capitalCase", description: "This Is A Capital Case Example" },
  { label: "constantCase", description: "THIS_IS_A_CONSTANT_CASE_EXAMPLE" },
  { label: "dotCase", description: "this.is.a.dot.case.example" },
  { label: "headerCase", description: "This-Is-A-Header-Case-Example" },
  { label: "noCase", description: "this is a no case example" },
  { label: "paramCase", description: "this-is-a-param-case-example" },
  { label: "pascalCase", description: "ThisIsAPascalCaseExample" },
  { label: "pathCase", description: "this/is/a/path/case/example" },
  { label: "sentenceCase", description: "This is a sentence case example" },
  { label: "snakeCase", description: "this_is_a_snake_case_example" }
];

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

// TODO: this is obviously a repetition of 90% of the previous one, so, should be reused 

export async function changeCaseTo(textCase: string | undefined) {
  if (!textCase)
  {
    var picked = await vscode.window.showQuickPick(textCases2);
    textCase = picked?.label;
  }

  if (!textCase) return;

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
      var casedText = getCasedText(text, configuredCaseFunctions, textCase)
      editBuilder.replace(range, casedText);
    });
  });
}

function getCasedText(
  text: string,
  caseFunctions: Array<(input: string) => string>,
  textCase: string): string {
    const caseFunc = changeCaseFunctions[textCase as keyof typeof changeCaseFunctions];
    const casedText = caseFunc(text, 0);
    return casedText ?? text;
}
