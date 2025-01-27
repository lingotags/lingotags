import fs from "fs";
import { glob } from "glob";
import path from "path";

import { TranslationGeneratorConfig, TranslationOutput } from "./types/types";
import { searchPatterns } from "./utils/searchPatterns";
import { logVerbose, processFileContent, writeOutputFile } from "./utils/utils";

export async function generateTranslationTags(
  config: TranslationGeneratorConfig
): Promise<void> {
  const finalConfig = {
    filePattern: "**/*.html",
    verbose: false,
    ...config,
  };

  try {
    const searchPath = path.resolve(process.cwd(), finalConfig.searchDirectory);
    console.log("Resolved search path:", searchPath);

    // Add directory content listing
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

    // Use forward slashes for glob pattern
    const pattern = finalConfig.filePattern?.replace(/\\/g, "/") || "**/*.html";
    console.log("Search pattern:", pattern);

    // Use process.cwd() as the base for glob
    const files = await glob(pattern, {
      cwd: searchPath,
      absolute: true,
      windowsPathsNoEscape: true,
    });

    console.log("Found files:", files);
    logVerbose(finalConfig.verbose, `Found ${files.length} files to process`);

    // Process files and collect output
    const output: TranslationOutput = {};

    files.forEach((filePath) => {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { modifiedContent, matches } = processFileContent(
          fileContent,
          searchPatterns
        );

        if (matches.length > 0) {
          output[filePath] = matches;
          fs.writeFileSync(filePath, modifiedContent, "utf-8");
          logVerbose(
            finalConfig.verbose,
            `Processed ${matches.length} tags in ${filePath}`
          );
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    });

    // Write output to JSON file
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

// Example usage function
export async function main() {
  await generateTranslationTags({
    searchDirectory: "./about",
    outputFile: "translation_tags.json",
    verbose: true,
  });
}

// Only run main if this file is being run directly
if (require.main === module) {
  main();
}
