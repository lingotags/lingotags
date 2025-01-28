export interface TranslationGeneratorConfig {
  searchDirectory: string;
  outputFile: string;
  filePattern?: string;
  verbose?: boolean;
}

export interface TranslationMatch {
  key: string;
  tag: string;
  content: string;
  dynamic?: boolean;
}
export interface TranslationOutput {
  [filePath: string]: TranslationMatch[];
}
