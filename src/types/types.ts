export interface TranslationGeneratorConfig {
  searchDirectory: string;
  outputFile: string;
  filePattern?: string;
  defaultLanguage:string;
  verbose?: boolean;
  manifest?: string;
}

export interface TranslationMatch {
  key: string;
  tag: string;
  content: string;
  dynamic?: boolean;
  manifest?: string; 
}
export interface TranslationOutput {
  [filePath: string]: TranslationMatch[];
}
