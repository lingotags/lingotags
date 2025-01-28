import fs from "fs";
import path from "path";
import { TranslationMatch } from "../types/types";

let globalKeyCounter = 0;

export function escapeJson(str: string): string {
  return str
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

export function logVerbose(verbose: boolean, message: string): void {
  if (verbose) {
    console.log(message);
  }
}

export function writeOutputFile(
  outputFile: string,
  output: Record<string, TranslationMatch[]>
): void {
  const relativeOutput: Record<string, TranslationMatch[]> = {};

  for (const [filePath, matches] of Object.entries(output)) {
    const relativePath = getRelativePath(filePath);
    relativeOutput[relativePath] = matches;
  }

  fs.writeFileSync(
    outputFile,
    JSON.stringify(relativeOutput, null, 2),
    "utf-8"
  );
}

export function generateUniqueKey(): string {
  globalKeyCounter++;
  return `unique_key_${globalKeyCounter}`;
}

export function extractTagContent(html: string): string {
  return html
    .replace(/<(\w+)(\s+[^>]*?)?>/g, "<$1>")
    .replace(/<[^>]+?>(.*?)<\/[^>]+?>/g, "$1")
    .replace(/<[^>]+?\/?>/g, "")
    .replace(/{.*?}/g, "")
    .replace(/<\/?[a-zA-Z0-9-]+(.*?)\/?>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTagName(html: string): string {
  const match = html.match(/<([a-zA-Z0-9]+)/);
  return match ? match[1].toLowerCase() : "";
}

export function getRelativePath(absolutePath: string): string {
  const appIndex = absolutePath.indexOf("app");
  if (appIndex !== -1) {
    return absolutePath.slice(appIndex).replace(/\\/g, "/");
  }
  return path.basename(absolutePath);
}

export function shouldProcessElement(rawHtml: string): boolean {
  const staticContent = extractTagContent(rawHtml);
  const hasStaticText = staticContent.length > 0;

  const hasJSX = /{.*?}/.test(rawHtml);

  return hasStaticText && (!hasJSX || (hasJSX && staticContent !== ""));
}

export function processFileContent(
  fileContent: string,
  searchPatterns: RegExp[]
): { modifiedContent: string; matches: TranslationMatch[] } {
  let modifiedContent = fileContent;
  const matches: TranslationMatch[] = [];
  const keyNumberMap = new Map<string, number>();

  searchPatterns.forEach((pattern) => {
    const patternMatches = [...fileContent.matchAll(pattern)];
    patternMatches.forEach((match) => {
      const keyMatch = match[0].match(/key="([^"]+)"/);
      if (keyMatch) {
        const fullKey = keyMatch[1];
        const numberedMatch = fullKey.match(/unique_key_(\d+)/);
        if (numberedMatch) {
          const keyNum = parseInt(numberedMatch[1], 10);
          keyNumberMap.set(fullKey, keyNum);
          if (keyNum > globalKeyCounter) {
            globalKeyCounter = keyNum;
          }
        }

        const content = extractTagContent(match[0]);
        matches.push({
          key: fullKey,
          tag: extractTagName(match[0]),
          content,
        });
      }
    });
  });

  searchPatterns.forEach((pattern) => {
    const patternMatches = [...fileContent.matchAll(pattern)];
    patternMatches.forEach((match) => {
      const tagContent = match[0];
      if (tagContent.includes('key="')) return;

      if (!shouldProcessElement(tagContent)) return;

      const uniqueKey = generateUniqueKey();
      let content = extractTagContent(tagContent)
        .replace(/\s{2,}/g, " ")
        .trim();

      const tagName = extractTagName(tagContent);
      if (tagName === "button") {
        const buttonContent = extractTagContent(tagContent);
        const cleanContent = buttonContent
          .replace(/>/g, " ")
          .replace(/{.*?}/g, "")
          .trim();
        content = cleanContent || extractTagContent(tagContent);
      } else {
        content = extractTagContent(tagContent);
      }

      modifiedContent = modifiedContent.replace(
        tagContent,
        tagContent.replace(/<([^\s>]+)([^>]*)>/, `<$1 key="${uniqueKey}"$2>`)
      );

      matches.push({
        key: uniqueKey,
        tag: extractTagName(tagContent),
        content,
      });
    });
  });

  return { modifiedContent, matches };
}
