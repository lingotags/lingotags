export {
  TranslationGeneratorConfig,
  TranslationMatch,
  TranslationOutput,
} from "./types/types";
export { searchPatterns } from "./utils/searchPatterns";
import { generateTranslationTags } from "./translationGenerator";
import { loadConfig } from "./utils/configUtils";

const main = async () => {
  const config = loadConfig();
  await generateTranslationTags(config);
};

if (require.main === module) {
  main();
}
