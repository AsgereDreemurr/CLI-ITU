import { Command, flags } from "@oclif/command";
import * as shell from "shelljs";
import path = require("path");

export default class java extends Command {
  static description = "run the specified Java program.";

  static examples = [
    "$ itu java MyClass.java",
    "$ itu java DisjointSets.java -n -t",
    "$ itu java MyClass.java AnotherClass -i='./input/1.in'",
  ];

  static flags = {
    help: flags.help({ char: "h" }),
    // flag with no value (-f, --force)
    time: flags.boolean({
      char: "t",
      description: "Measure the time to execute the program",
    }),
    nocompile: flags.boolean({
      char: "n",
      description: "Run the program without compiling the file first",
    }),
    input: flags.string({
      char: "i",
      description: "Input file to redirect",
    }),
    dir: flags.string({
      char: "d",
      description: "Define the directory of the java file",
    }),
  };

  static args = [
    {
      name: "filename",
      description: "The name of the Java file",
      required: true,
    },
    {
      name: "mainclass",
      description:
        "Specify the main class.\nLeave blank, if the main class has the same name as the .java file",
      required: false,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = this.parse(java);

    const mainClass = args.mainclass ?? path.basename(args.filename, ".java");
    const directory = flags.dir ?? "./";
    const input = flags.input ? "< " + flags.input : "";

    if (!flags.nocompile) {
      console.log("Compiling");
      shell.exec(`javac ${args.filename}`, { async: false });
    }

    const command = `java -cp ${directory} ${mainClass} ${input}`;

    if (flags.time) {
      const t0 = process.hrtime()[1];
      shell.exec(command, { async: true });
      const t1 = process.hrtime()[1];
      const miliseconds = (t1 - t0) * 0.000_001;
      this.log("⏳ time: " + miliseconds.toFixed(1) + "ms");
    } else {
      shell.exec(command, { async: true });
    }
    shell.exit(0);
  }
}
