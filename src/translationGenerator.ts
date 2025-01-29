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
      throw new Error(`Search directory does not exist: ${searchPath}`);
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
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { modifiedContent, matches, originalContent } =
          processFileContent(fileContent, searchPatterns);

        if (matches.length > 0) {
          output[filePath] = matches;
          fs.writeFileSync(filePath, modifiedContent, "utf-8");
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
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
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
    console.error("Error generating translation tags:", error);
    process.exit(1);
  }
}
