# unicodegen

unicodegen is a CLI tool that generates unicode based from command line args.

It's convenient for easily generating the unicode used with jTegaki.

## Installation

It's bundled in `@tecack/tools`.

## Usage

```json
// package.json
{
  "scripts": {
    "unicodegen": "tecack unicodegen あ い う え お"
  }
}
```

## Options

| option    | alias | description                                                                                                                                           | default | example |
| --------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| map       | m     | When this option is enabled, it outputs the map of characters to Unicode. By default, it's set to false, in which case only the Unicode is outputted. | false   | --map   |
| separator | s     | You can specify the separator when outputting multiple results. By default, it's set to "\n", which outputs with line breaks.                         | "\n"    | -s=","  |
