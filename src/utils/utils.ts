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
  /*
  • When true, prints additional information during file processing
  • Helps in debugging and understanding what the script is doing
  • Example: Shows how many files were found, which files were processed, etc.
  */
  if (verbose) {
    console.log(message);
  }
}

export function writeOutputFile(
  outputFile: string,
  output: Record<string, TranslationMatch[]>
): void {
  // Convert absolute paths to relative paths in the output
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
  // Remove HTML tags and trim whitespace
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractTagName(html: string): string {
  const match = html.match(/<([a-zA-Z0-9]+)/);
  return match ? match[1].toLowerCase() : "";
}

export function getRelativePath(absolutePath: string): string {
  // Find the 'app' directory in the path and return everything after it
  const appIndex = absolutePath.indexOf("app");
  if (appIndex !== -1) {
    return absolutePath.slice(appIndex).replace(/\\/g, "/");
  }
  return path.basename(absolutePath);
}

export function processFileContent(
  fileContent: string,
  searchPatterns: RegExp[]
): { modifiedContent: string; matches: TranslationMatch[] } {
  let modifiedContent = fileContent;
  const matches: TranslationMatch[] = [];

  searchPatterns.forEach((pattern) => {
    const patternMatches = [...fileContent.matchAll(pattern)];

    patternMatches.forEach((match) => {
      const uniqueKey = generateUniqueKey();
      const tag = extractTagName(match[0]);
      const content = extractTagContent(match[0]);

      // Skip empty content
      if (!content.trim()) return;

      // Replace match with key in the first tag
      modifiedContent = modifiedContent.replace(
        match[0],
        match[0].replace(/<([^\s>]+)([^>]*)>/, `<$1 key="${uniqueKey}"$2>`)
      );

      matches.push({
        key: uniqueKey,
        tag,
        content,
      });
    });
  });

  return { modifiedContent, matches };
}
