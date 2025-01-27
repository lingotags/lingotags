import fs from "fs";
import inquirer from "inquirer";

const DEFAULT_CONFIG_PATH = "./config.json";

export const initConfig = async () => {
  try {
    if (fs.existsSync(DEFAULT_CONFIG_PATH)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: "Config file already exists. Do you want to overwrite?",
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log("Configuration initialization cancelled.");
        return;
      }
    }

    const config = await inquirer.prompt([
      {
        type: "input",
        name: "searchDirectory",
        message: "Enter search directory:",
        default: "./src",
        validate: (input: string) =>
          input.trim().length > 0 ? true : "Search directory is required",
      },
      {
        type: "input",
        name: "outputFile",
        message: "Enter output file name:",
        default: "translations.json",
        validate: (input: string) =>
          input.trim().length > 0 ? true : "Output file name is required",
      },
      {
        type: "input",
        name: "filePattern",
        message: "Enter file pattern to search:",
        default: "**/*.{html,tsx,jsx}",
      },
      {
        type: "confirm",
        name: "verbose",
        message: "Enable verbose logging?",
        default: false,
      },
    ]);

    fs.writeFileSync(
      DEFAULT_CONFIG_PATH,
      JSON.stringify(config, null, 2),
      "utf-8"
    );

    console.log(`✅ Configuration file created: ${DEFAULT_CONFIG_PATH}`);
  } catch (error) {
    console.error("Error creating configuration:", error);
    process.exit(1);
  }
};
