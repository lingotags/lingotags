import fs from "fs";
import { glob } from "glob";
import path from "path";

import { TranslationGeneratorConfig, TranslationOutput } from "./types/types";
import { searchPatterns } from "./utils/searchPatterns";
import {
  getGlobalKeyCounter,
  logVerbose,
  processFileContent,
  setGlobalKeyCounter,
  writeManifest,
  writeOutputFile,
} from "./utils/utils";

export async function generateTranslationTags(
  config: TranslationGeneratorConfig
): Promise<void> {
  const finalConfig = {
    filePattern: "**/*.html",
    verbose: false,
    ...config,
    manifest: path.resolve(
      process.cwd(),
      config.manifest || "lingotags-manifest.json"
    ),
  };

  try {
    const searchPath = path.resolve(process.cwd(), finalConfig.searchDirectory);
    console.log("Resolved search path:", searchPath);

    console.log("Directory contents:");
    try {
      const contents = fs.readdirSync(searchPath, { recursive: true });
      console.log(contents);
    } catch (error) {
      console.error("Error reading directory:", error);
    }

    if (!fs.existsSync(searchPath)) {
      throw new Error(`Target directory not found: ${searchPath}`);
    }

    try {
      const contents = fs.readdirSync(searchPath, { recursive: true });
      logVerbose(finalConfig.verbose, `📂 Processing directory: ${searchPath}`);
      logVerbose(
        finalConfig.verbose,
        `📄 Found ${contents.length} items: ${contents.join(", ")}`
      );
    } catch (error) {
      console.error(
        `❌ Error reading directory ${searchPath}: ${(error as Error).message}`
      );
      throw error;
    }

    const pattern = finalConfig.filePattern?.replace(/\\/g, "/") || "**/*.html";
    console.log("Search pattern:", pattern);

    const files = await glob(pattern, {
      cwd: searchPath,
      absolute: true,
      windowsPathsNoEscape: true,
    });

    console.log("Found files:", files);
    logVerbose(finalConfig.verbose, `Found ${files.length} files to process`);

    const output: TranslationOutput = {};

    const fileChanges: Array<{
      filePath: string;
      original: string;
      modified: string;
    }> = [];
    const initialKeyCounter = getGlobalKeyCounter();

    files.forEach((filePath) => {
      try {
        logVerbose(finalConfig.verbose, `🔍 Scanning file: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, "utf-8");

        if (!fileContent.trim()) {
          logVerbose(finalConfig.verbose, `⏩ Skipped empty file: ${filePath}`);
          return;
        }

        const { modifiedContent, matches, originalContent } =
          processFileContent(fileContent, searchPatterns);

        if (matches.length === 0) {
          logVerbose(
            finalConfig.verbose,
            `➖ No tags found in ${path.basename(filePath)}`
          );
          return;
        }

        logVerbose(
          finalConfig.verbose,
          `✅ Found ${matches.length} tags in ${path.basename(filePath)}`
        );

        output[filePath] = matches;
        if (modifiedContent !== originalContent) {
          fs.writeFileSync(filePath, modifiedContent, "utf-8");
          logVerbose(
            finalConfig.verbose,
            `💾 Saved changes to ${path.basename(filePath)}`
          );
        }
        fileChanges.push({
          filePath,
          original: originalContent,
          modified: modifiedContent,
        });
        logVerbose(
          finalConfig.verbose,
          `Processed ${matches.length} tags in ${filePath}`
        );
        if (matches.length > getGlobalKeyCounter()) {
          setGlobalKeyCounter(matches.length);
        }
      } catch (error) {
        console.error(
          `❌ Error processing ${filePath}: ${(error as Error).message}`
        );
        throw error;
      }
    });

    writeManifest(finalConfig.manifest, initialKeyCounter, fileChanges);
    console.log(`📦 Manifest file created: ${finalConfig.manifest}`);

    writeOutputFile(finalConfig.outputFile, output);
    console.log(
      "Translation tags generated successfully. " +
        `Output file: ${finalConfig.outputFile}`
    );
  } catch (error) {
    console.error(
      `🚨 Translation generation failed: ${(error as Error).message}`
    );
    process.exit(1);
  }
}
