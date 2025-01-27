# Translation Tag Generator 🌍

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/lingotags.svg)](https://www.npmjs.com/package/lingotags)

A powerful TypeScript utility for automatically generating translation keys in HTML and component files across your project. Perfect for internationalizing React, Next.js, and other web applications.

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

This creates a `config.json` file with the following structure:

```json
{
  "searchDirectory": "./src",
  "outputFile": "translations.json",
  "filePattern": "**/*.{html,tsx,jsx}",
  "verbose": false
}
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
| `filePattern`     | `string`  | Glob pattern for file selection     | `**/*.{html,tsx,jsx}` |
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

- Typography
  - `h1` to `h6` headings
  - `p` paragraphs
  - `span` elements
- Interactive Elements
  - `button`
  - `a` links
- Form Elements
  - `label`
  - `input` (placeholder text)
  - `textarea`

### UI Components

- Shadcn/UI

## Example Usage

### Before:

```tsx
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
function Welcome() {
  return (
    <div>
      <h1 key="unique_key_1">Welcome to our store</h1>
      <p key="unique_key_2">The best eco-friendly products</p>
    </div>
  );
}
```

## CLI Commands

```bash
# Initialize new configuration
npx lingotags init

# Generate translations
npx lingotags generate
# Or use shorthand
npx lingotags gen
npx lingotags g

# Show version
npx lingotags --version

# Display help
npx lingotags --help
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Bug Reports

Please use the [GitHub Issues](https://github.com/imadselka/lingotags/issues) page to report any bugs or file feature requests.

## Contact

- GitHub: [@imadselka](https://github.com/imadselka)
- [@mohsenGhalem](https://github.com/mohsenGhalem)

## Documentation

For more detailed documentation, examples, and guides, visit our [documentation site](https://github.com/imadselka/lingotags).
