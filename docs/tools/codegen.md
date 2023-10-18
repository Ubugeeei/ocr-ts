# codegen

codegen generates code in various languages based on the XML created with j-tegaki.
Currently, only TypeScript is supported.

This is a CLI tool.

## Installation

It's bundled in `@tecack/tools`.

## Usage

```json
// package.json
{
  "scripts": {
    "jTegaki": "tecack codegen -d=dataset -o=out/data.ts"
  }
}
```

## Options

| option     | alias | description                                                                                                                                 | default                 | example              |
| ---------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------- |
| dataDir    | d     | Specifies the directory path where the XML files are located. <br/> Currently, only a single path is supported. (Wildcards are not allowed) | ${cwd}/tecack_data      | --dataDir=my-dataset |
| out        | o     | Specifies the destination for the generated code. Please include the filename and its extension.                                            | ${cwd}/tecack_data/data | --out=out/data.ts    |
| exportName | n     | Allows you to specify the identifier for the generated code.                                                                                | "TEGAKI_DATA_SET"       | --exportName=MY_DATA |
| ts         | --    | Generates as TypeScript code. Type imports and type annotations will be added.                                                              | true                    | --ts                 |
| cjs        | --    | Generates as CommonJS code. A declaration for module.exports will be generated. <br/> If this option is enabled, the ts option is ignored.  | false                   | --cjs                |
