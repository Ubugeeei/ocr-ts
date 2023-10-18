import { defineCommand, runMain, runCommand } from "citty";
import { unicodegen } from "./cmd/unicodegen";
import { openJTegaki } from "./cmd/jTegaki";
import { codegen } from "./cmd/codegen";

const main = defineCommand({
  meta: { name: "tecack tools tools" },
  async run({ rawArgs }) {
    const [command] = rawArgs;
    switch (command) {
      case "unicodegen":
        await runCommand(unicodegen, {
          rawArgs: rawArgs.slice(1),
        });
        break;
      case "jTegaki":
        await runCommand(openJTegaki, {
          rawArgs: rawArgs.slice(1),
        });
        break;
      case "codegen":
        await runCommand(codegen, {
          rawArgs: rawArgs.slice(1),
        });
        break;
      default: {
        console.log(`Usage: tecack <command> [options]
available commands:
  - unicodegen
  - jTegaki
  - codegen`);
        break;
      }
    }
  },
});

runMain(main);
