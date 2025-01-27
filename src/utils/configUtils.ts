import fs from "fs";
import path from "path";
import { z } from "zod";

export const ConfigSchema = z.object({
  searchDirectory: z
    .string()
    .min(3, "Search directory is required, and must be at least 3 characters"),
  outputFile: z
    .string()
    .min(3, "Output file path is required and must be at least 3 characters"),
  filePattern: z.string().optional().default("**/*.{html,tsx,jsx}"),
  verbose: z.boolean().optional().default(false),
});

export type TranslationConfig = z.infer<typeof ConfigSchema>;

export const loadConfig = (
  configPath: string = "./config.json"
): TranslationConfig => {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  const rawConfig = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  return ConfigSchema.parse(rawConfig);
};

// Optional: Configuration Validation Function
export const validateConfig = (config: unknown): TranslationConfig =>
  ConfigSchema.parse(config);
