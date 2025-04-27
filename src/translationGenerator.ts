import fs from "fs";
import { glob } from "glob";
import path from "path";

import { TranslationGeneratorConfig, TranslationOutput } from "./types/types";
import { searchPatterns } from "./utils/searchPatterns";
import {
  exportTranslations,
  getGlobalKeyCounter,
  initializeKeyCounter,
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
    filePattern: "**/*.{html,tsx,jsx,js,ts}",
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

    const allFiles = await glob(pattern, {
      cwd: searchPath,
      absolute: true,
      windowsPathsNoEscape: true,
    });

    initializeKeyCounter(allFiles);
    const initialKeyCounter = getGlobalKeyCounter();
    console.log(`🔑 Initialized key counter at: ${initialKeyCounter}`);

    const output: TranslationOutput = {};

    const fileChanges: Array<{
      filePath: string;
      original: string;
      modified: string;
    }> = [];

    allFiles.forEach((filePath) => {
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

    // After processing all files, create locale file
    const localesDir = path.join(process.cwd(), "locales");
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }

    const langFile = path.join(
      localesDir,
      `${config.defaultLanguage || "en"}.json`
    );
    const translations: Record<string, string> = {};

    // Flatten all translations into single object
    Object.values(output).forEach((matches) => {
      matches.forEach((match) => {
        translations[match.key] = match.content;
      });
    });

    // Use the new exportTranslations function
    exportTranslations(langFile, translations, true);
    console.log(`🌐 Updated language file: ${langFile}`);

    // Also create a README.md with instructions for the locales directory if it doesn't exist
    const readmePath = path.join(localesDir, "README.md");
    if (!fs.existsSync(readmePath)) {
      const readmeContent = `# Translation Files

This directory contains the translation files for your application.

## Usage

To use these translations in your React components:

\`\`\`jsx
// Import the translation function
import { useTranslation } from 'your-translation-library'; // e.g., react-i18next

function MyComponent() {
  // Initialize the translation function
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('unique_key_1')}</h1>
      <p>{t('unique_key_2')}</p>
    </div>
  );
}
\`\`\`

## Adding New Languages

To add a new language, create a new JSON file with the language code as the filename, for example \`fr.json\` for French.
Copy the content from \`${config.defaultLanguage || "en"}.json\` and translate the values.
`;
      
      fs.writeFileSync(readmePath, readmeContent, "utf-8");
      console.log(`📘 Created README for translations: ${readmePath}`);
    }
    
  } catch (error) {
    console.error(
      `🚨 Translation generation failed: ${(error as Error).message}`
    );
    process.exit(1);
  }
}
