# Translation Tag Generator 🌍

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/lingotags.svg)](https://www.npmjs.com/package/lingotags)

A powerful TypeScript utility for automatically generating translation keys in HTML and component files across your project. Perfect for internationalizing React, Next.js, and other web applications.

## Table of Contents

- [Translation Tag Generator 🌍](#translation-tag-generator-)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
    - [1. Initialize Configuration](#1-initialize-configuration)
      - [Initialization Process](#initialization-process)
    - [2. Generate Translation Tags](#2-generate-translation-tags)
  - [Configuration Options](#configuration-options)
  - [Output Format](#output-format)
  - [Supported Elements](#supported-elements)
    - [HTML Elements](#html-elements)
    - [UI Components](#ui-components)
  - [Example Usage](#example-usage)
    - [Before:](#before)
    - [After:](#after)
  - [Navbar Integration](#navbar-integration)
    - [Translation Utility](#translation-utility)
    - [Navbar Component](#navbar-component)
  - [CLI Commands](#cli-commands)
  - [License](#license)
  - [Bug Reports](#bug-reports)
  - [Documentation](#documentation)
  - [Updated Usage - React components with t() function](#updated-usage---react-components-with-t-function)

## Features

- Automatically detect translatable content in HTML/component files
- Generate sequential unique translation keys across all files
- Modify source files with translation key attributes
- Create a centralized translation mapping JSON
- Support for multiple component types and frameworks
- Easy-to-use CLI interface
- Fast and efficient processing
- Highly configurable

## Installation

```bash
npm install lingotags
# or
yarn add lingotags
# or
pnpm add lingotags
```

## Quick Start

### 1. Initialize Configuration

```bash
npx lingotags init
```

#### Initialization Process

You'll be guided through these configuration questions:

```bash
✔ Enter search directory: (./src)
✔ Enter output file name: (translations.json)
✔ Enter manifest file name for reverts: (lingotags-manifest.json)
✔ Enter file pattern to search: (**/*.{html,tsx,jsx})
✔ Enter default language code (ex: en, fr, es): (en)
✔ Enable verbose logging? (y/N)
✅ Configuration file created: ./config.json
```

### 2. Generate Translation Tags

```bash
npx lingotags generate
# or use aliases
npx lingotags gen
npx lingotags g
```

## Configuration Options

| Option            | Type      | Description                         | Default               |
| ----------------- | --------- | ----------------------------------- | --------------------- |
| `searchDirectory` | `string`  | Root directory to search for files  | **Required**          |
| `outputFile`      | `string`  | Path for generated translation JSON | **Required**          |
| `manifest`        | `string`  | Path to the manifest file           | `manifest.json`       |
| `filePattern`     | `string`  | Glob pattern for file selection     | `**/*.{html,tsx,jsx}` |
| `defaultLanguage` | `string`  | Default language for translations   | `en`                  |
| `verbose`         | `boolean` | Enable detailed logging             | `false`               |

## Output Format

The generator creates a `translations.json` file with the following structure:

```json
{
  "app/about/page.tsx": [
    {
      "key": "unique_key_1",
      "tag": "h1",
      "content": "About Us"
    },
    {
      "key": "unique_key_2",
      "tag": "p",
      "content": "Welcome to our website"
    }
  ]
}
```

## Supported Elements

### HTML Elements

- Typography: `h1` to `h6`, `p`, `span`
- Interactive Elements: `button`, `a`
- Form Elements: `label`, `input` (placeholder), `textarea`

### UI Components

- Shadcn/UI

## Example Usage

### Before:

```tsx
// app/page.tsx
function Welcome() {
  return (
    <div>
      <h1>Welcome to our store</h1>
      <p>The best eco-friendly products</p>
    </div>
  );
}
```

### After:

```tsx
// app/page.tsx
function Welcome() {
  return (
    <div>
      <h1 data-i18n-key="unique_key_1">Welcome to our store</h1>
      <p data-i18n-key="unique_key_2">The best eco-friendly products</p>
    </div>
  );
}
```

## Navbar Integration

### Translation Utility

```typescript
// utils/translation.ts
export function getStoredLanguage() {
  return typeof window === "undefined"
    ? "en"
    : localStorage.getItem("selectedLanguage") || "en";
}

export async function applyTranslations(lang: string) {
  try {
    localStorage.setItem("selectedLanguage", lang);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const response = await fetch(`/locales/${lang}.json`);
    const translations = await response.json();
    document.querySelectorAll("[data-i18n-key]").forEach((el) => {
      const key = el.getAttribute("data-i18n-key");
      if (key && translations[key]) {
        el.textContent = translations[key];
      }
    });
  } catch (error) {
    console.error("Translation error:", error);
  }
}
```

### Navbar Component

```tsx
// components/navbar.tsx
"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyTranslations, getStoredLanguage } from "@/lib/translation";
import { useEffect, useState } from "react";

export function Navbar() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const storedLang = getStoredLanguage();
    setLanguage(storedLang);
    applyTranslations(storedLang);
  }, []);

  const languages = ["en", "ar", "de", "fr"];

  return (
    <nav>
      <Select
        value={language}
        onValueChange={async (value) => {
          setLanguage(value);
          await applyTranslations(value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </nav>
  );
}
```

## CLI Commands

```bash
npx lingotags init

npx lingotags generate
npx lingotags gene
npx lingotags g

npx lingotags revert
npx lingotags r

npx lingotags version
npx lingotags help
```

## License

MIT License - see [LICENSE](LICENSE)

## Bug Reports

Report issues on [GitHub](https://github.com/imadselka/lingotags/issues)

## Documentation

Visit our [documentation site](https://lingotags.vercel.app).

## Updated Usage - React components with t() function

LingoTags now supports modern translation approaches using the t() function commonly found in i18n libraries like react-i18next, next-i18next, or next-intl.

### Usage with t() function

1. Run the tool to extract translatable strings from your components:

```bash
npx lingotags --search "./app" --output "./translations.json" --language "en"
```

2. LingoTags will:
   - Find translatable text in your components
   - Replace static text with `{t('unique_key_X')}` function calls
   - Generate translation files in the `locales` directory

3. Use the translations in your components with your preferred i18n library:

```jsx
// Example with react-i18next
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('unique_key_1')}</h1>
      <p>{t('unique_key_2')}</p>
    </div>
  );
}
```

### Translation files

The translation files are created in the `locales` directory:

```json
// locales/en.json
{
  "unique_key_1": "Welcome to our store",
  "unique_key_2": "The best eco-friendly products"
}
```

Add additional language files by copying the default language file and translating the values.
