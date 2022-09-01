/* eslint-disable no-process-env */
import { inspect } from "util";
import * as fs from "fs";

import * as core from "@actions/core";

import { LineFormatter, getAppropriateFormatter } from "./formatters";

interface FileContentMapping {
  path: string;
  contents: string;
}

export function getFileContents(
  defaultFileDetectionLocations: string[] = ["CODEOWNERS", "docs/CODEOWNERS", ".github/CODEOWNERS"]
): FileContentMapping[] {
  const filePath = core.getInput("file-path", { required: true });
  let locationsToCheck = defaultFileDetectionLocations;
  if (filePath.length > 0) {
    const thisPlatformPath = core.toPlatformPath(filePath);
    core.debug(`Using specified path: ${thisPlatformPath}`);

    locationsToCheck = [thisPlatformPath];
  } else {
    core.info("Did not find specified input path, using default detection method.");
  }
  const existingPaths = locationsToCheck.filter((path) => {
    return fs.existsSync(path);
  });

  return existingPaths.map((path) => {
    core.notice(`Found CODEOWNERS file at '${path}' to reformat.`);
    return {
      path,
      contents: fs.readFileSync(path, "utf8"),
    };
  });
}

export function formatContents(
  formatter: LineFormatter,
  fileContents: FileContentMapping,
  removeEmptyLines: boolean = false
): FileContentMapping {
  const lines = fileContents.contents.split("\n");

  const lineLengths = lines
    .filter((line) => {
      return !line.startsWith("#") && line.length > 0;
    })
    .map((line) => {
      const [path, ..._] = line.split(" ");
      return path.length;
    });
  const maxLineLength = Math.max(...lineLengths);

  let formattedLines = lines.map((line) => {
    return formatter.formatLine(line, maxLineLength);
  });

  if (removeEmptyLines) {
    core.debug("Removing empty lines...");
    formattedLines = formattedLines.filter((line) => line.length > 0);
  }

  let newFormattedContents = formattedLines.join("\n");
  if (!newFormattedContents.endsWith("\n")) {
    newFormattedContents += "\n";
  }

  return {
    path: fileContents.path,
    contents: newFormattedContents,
  };
}

export function writeToFile(fileContent: FileContentMapping, newFileName = "CODEOWNERS"): void {
  const newFilePath = fileContent.path.includes("/")
    ? `${fileContent.path.substring(0, fileContent.path.lastIndexOf("/"))}/${newFileName}`
    : fileContent.path;

  fs.writeFileSync(newFilePath, fileContent.contents);
  core.info(`Successfully reformatted file at '${fileContent.path}'.`);
}

export function main() {
  try {
    const currentCodeowners = getFileContents();
    if (currentCodeowners.length === 0) {
      const errorMsg = "No CODEOWNERS file(s) found.";
      core.error(errorMsg);
      throw new Error(errorMsg);
    }

    const inputFormatType = core.getInput("format-type", { required: false }) || "lined-up";
    core.debug(`Using format type: ${inputFormatType}`);
    const formatter = getAppropriateFormatter(inputFormatType);

    const inputRemoveEmptyLines: string = core.getInput("remove-empty-lines", { required: false });
    const shouldRemoveEmptyLines: boolean = inputRemoveEmptyLines
      ? inputRemoveEmptyLines === "true"
      : false;
    core.debug(`Remove empty lines? : ${shouldRemoveEmptyLines}`);
    const newCodeowners: FileContentMapping[] = currentCodeowners.map((fileContents) => {
      return formatContents(formatter, fileContents, shouldRemoveEmptyLines);
    });

    newCodeowners.forEach((fileContents) => {
      writeToFile(fileContents, "CODEOWNERS");
    });
  } catch (error: any) {
    core.debug(inspect(error));
    core.setOutput("success", false);
    core.setFailed(error.message);
  }
}

if (process.env.NODE_ENV !== "test") {
  main();
}
