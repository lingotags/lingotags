#!/usr/bin/env node

import { initConfig } from "../cli/init";
import { generateTranslationTags } from "../translationGenerator";
import { loadConfig } from "../utils/configUtils";

const run = async () => {
  try {
    const command = process.argv[2] || "help";
    console.log("Running command:", command);

    switch (command) {
      case "--version":
      case "-v":
        const packageJson = require("../../package.json");
        console.log(`v${packageJson.version}`);
        break;
      case "init":
        await initConfig();
        break;
      case "generate":
      case "gen":
      case "g":
        try {
          console.log("Attempting to load config...");
          const config = loadConfig();
          console.log("Config loaded:", config);

          if (!config) {
            console.error(
              "Config file not found. Please run 'npm run tags init' first"
            );
            process.exit(1);
          }

          console.log("Starting translation generation...");
          await generateTranslationTags(config);
          console.log("Translation generation complete");
        } catch (error: any) {
          console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
          process.exit(1);
        }
        break;
      case "help":
      default:
        console.log(`Usage: translation-tags-generator <command>
          Commands:
            init      Create configuration file
            generate  Run translation tag generation (alias: gen, g)
            help      Show this help message
          Options:
            --version, -v  Show version number`);
    }
  } catch (error: any) {
    console.error("Unexpected error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception details:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection details:", {
    reason:
      reason instanceof Error
        ? {
            name: reason.name,
            message: reason.message,
            stack: reason.stack,
          }
        : reason,
    promise,
  });
  process.exit(1);
});

run();
