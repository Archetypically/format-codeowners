"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.writeToFile = exports.formatContents = exports.getFileContents = void 0;
/* eslint-disable no-process-env */
const util_1 = require("util");
const fs = __importStar(require("fs"));
const core = __importStar(require("@actions/core"));
const formatters_1 = require("./formatters");
function getFileContents(defaultFileDetectionLocations = ["CODEOWNERS", "docs/CODEOWNERS", ".github/CODEOWNERS"]) {
    const filePath = core.getInput("file-path", { required: true });
    let locationsToCheck = defaultFileDetectionLocations;
    if (filePath.length > 0) {
        const thisPlatformPath = core.toPlatformPath(filePath);
        core.debug(`Using specified path: ${thisPlatformPath}`);
        locationsToCheck = [thisPlatformPath];
    }
    else {
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
exports.getFileContents = getFileContents;
function formatContents(formatter, fileContents, removeEmptyLines = false) {
    const lines = fileContents.contents.split("\n");
    const lineLengths = lines
        .filter((line) => {
        return !line.startsWith("#") && line.length > 0;
    })
        .map((line) => {
        const [path, ..._] = line.trim().split(/\s+/);
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
exports.formatContents = formatContents;
function writeToFile(fileContent, newFileName = "CODEOWNERS") {
    const newFilePath = fileContent.path.includes("/")
        ? `${fileContent.path.substring(0, fileContent.path.lastIndexOf("/"))}/${newFileName}`
        : fileContent.path;
    fs.writeFileSync(newFilePath, fileContent.contents);
}
exports.writeToFile = writeToFile;
function main() {
    try {
        const currentCodeowners = getFileContents();
        if (currentCodeowners.length === 0) {
            const errorMsg = "No CODEOWNERS file(s) found.";
            core.error(errorMsg);
            throw new Error(errorMsg);
        }
        const inputFormatType = core.getInput("format-type", { required: false }) || "lined-up";
        core.debug(`Using format type: ${inputFormatType}`);
        const formatter = (0, formatters_1.getAppropriateFormatter)(inputFormatType);
        const inputRemoveEmptyLines = core.getInput("remove-empty-lines", { required: false });
        const shouldRemoveEmptyLines = inputRemoveEmptyLines
            ? inputRemoveEmptyLines === "true"
            : false;
        core.debug(`Remove empty lines? : ${shouldRemoveEmptyLines}`);
        const newCodeowners = currentCodeowners.map((fileContents) => {
            return formatContents(formatter, fileContents, shouldRemoveEmptyLines);
        });
        const changedFiles = [];
        newCodeowners.forEach((fileContents, index) => {
            if (currentCodeowners[index].contents !== fileContents.contents) {
                core.notice(`Changed detected for '${fileContents.path}'.`);
                changedFiles.push(fileContents.path);
                writeToFile(fileContents, "CODEOWNERS");
            }
            else {
                core.notice(`No changes detected for '${fileContents.path}'`);
            }
        });
        core.setOutput("formatted-files", changedFiles.join(" "));
        if (changedFiles.length > 0) {
            core.notice(`Made changes to the following files: ${changedFiles}`);
        }
        else {
            core.notice("No changes were made to any files.");
        }
    }
    catch (error) {
        core.debug((0, util_1.inspect)(error));
        core.setOutput("success", false);
        core.setFailed(error.message);
    }
}
exports.main = main;
if (process.env.NODE_ENV !== "test") {
    main();
}
