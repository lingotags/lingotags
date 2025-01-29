import fs from "fs";
import path from "path";
import { TranslationMatch } from "../types/types";

let globalKeyCounter = 0;

export function getGlobalKeyCounter(): number {
  return globalKeyCounter;
}

export function setGlobalKeyCounter(value: number): void {
  globalKeyCounter = value;
}

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
  return `unique_key_${++globalKeyCounter}`;
}

export function extractTagContent(html: string): string {
  // Remove all JSX expressions first (including nested ones)
  const withoutJSX = html.replace(/{[^{}]*}/g, "");

  // Remove HTML/JSX tags while preserving text content
  const withoutTags = withoutJSX.replace(/<[^>]+>/g, "");

  // Clean up residual characters and whitespace
  return withoutTags
    .replace(/["']/g, "") // Remove quotes
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/^ | $/g, "") // Trim edges
    .trim();
}

export function extractTagName(html: string): string {
  // Updated regex to handle JSX tags with namespace prefixes and custom elements
  const match = html.match(/<([a-zA-Z0-9-_:]+)(\s|>)/);
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
): {
  modifiedContent: string;
  matches: TranslationMatch[];
  originalContent: string;
} {
  const originalContent = fileContent;
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

  return { modifiedContent, matches, originalContent };
}

interface ChangeManifest {
  initialKeyCounter: number;
  changes: Array<{
    filePath: string;
    originalContent: string;
    modifiedContent: string;
  }>;
}

const DEFAULT_MANIFEST = "lingotags-manifest.json";

export function writeManifest(
  manifestPath: string = DEFAULT_MANIFEST,
  initialKeyCounter: number,
  fileChanges: Array<{ filePath: string; original: string; modified: string }>
): void {
  const manifest: ChangeManifest = {
    initialKeyCounter,
    changes: fileChanges.map(({ filePath, original, modified }) => ({
      filePath,
      originalContent: original,
      modifiedContent: modified,
    })),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
}

export function revertFromManifest(
  manifestPath: string = "lingotags-manifest.json"
): void {
  const resolvedPath = path.resolve(process.cwd(), manifestPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Manifest file not found: ${resolvedPath}`);
  }

  const manifest: ChangeManifest = JSON.parse(
    fs.readFileSync(resolvedPath, "utf-8")
  );

  manifest.changes.forEach(({ filePath, originalContent }) => {
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, originalContent, "utf-8");
    }
  });

  setGlobalKeyCounter(manifest.initialKeyCounter);
  fs.unlinkSync(resolvedPath);
}

export function findMaxExistingKey(content: string): number {
  const keyRegex = /unique_key_(\d+)/g;
  let maxKey = 0;
  let match;

  while ((match = keyRegex.exec(content)) !== null) {
    const keyNum = parseInt(match[1], 10);
    if (keyNum > maxKey) maxKey = keyNum;
  }

  return maxKey;
}

export function initializeKeyCounter(files: string[]): void {
  let maxKey = 0;

  files.forEach((filePath) => {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const fileMax = findMaxExistingKey(content);
      if (fileMax > maxKey) maxKey = fileMax;
    } catch (error) {
      console.error(`Error reading file ${filePath}: ${error}`);
    }
  });

  globalKeyCounter = Math.max(maxKey, 0);
}
