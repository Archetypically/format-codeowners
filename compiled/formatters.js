"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppropriateFormatter = exports.DoNothingFormatter = exports.LinedUpFormatter = exports.OneSpaceFormatter = exports.LineFormatter = void 0;
class LineFormatter {
}
exports.LineFormatter = LineFormatter;
class OneSpaceFormatter extends LineFormatter {
    formatLine(line, _) {
        if (line.startsWith("#") || line.length === 0) {
            return line;
        }
        const [path, ...owners] = line.split(" ").filter(String);
        const newPath = path;
        const formattedOwners = owners.join(" ");
        return `${newPath} ${formattedOwners}`;
    }
}
exports.OneSpaceFormatter = OneSpaceFormatter;
class LinedUpFormatter extends LineFormatter {
    formatLine(line, maxLength) {
        if (line.startsWith("#") || line.length === 0) {
            return line;
        }
        const [path, ...owners] = line.trim().split(/\s+/).filter(String);
        console.log(path);
        console.log(maxLength);
        const newPath = path.padEnd(maxLength, " ");
        const formattedOwners = owners.join(" ");
        return `${newPath} ${formattedOwners}`;
    }
}
exports.LinedUpFormatter = LinedUpFormatter;
class DoNothingFormatter extends LineFormatter {
    formatLine(line, _) {
        return line;
    }
}
exports.DoNothingFormatter = DoNothingFormatter;
function getAppropriateFormatter(formatType) {
    switch (formatType) {
        case "one-space":
            return new OneSpaceFormatter();
        case "lined-up":
            return new LinedUpFormatter();
        case "no-op":
            return new DoNothingFormatter();
        default:
            throw new Error(`Invalid format type: ${formatType}. Possible values are: one-space, lined-up, no-op`);
    }
}
exports.getAppropriateFormatter = getAppropriateFormatter;
