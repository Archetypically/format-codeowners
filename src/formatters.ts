export abstract class LineFormatter {
  abstract formatLine(line: string, maxLength: number): string;
}

export class OneSpaceFormatter extends LineFormatter {
  formatLine(line: string, _: number): string {
    if (line.startsWith("#") || line.length === 0) {
      return line;
    }

    const [path, ...owners] = line.split(" ").filter(String);
    const newPath = path;
    const formattedOwners = owners.join(" ");

    return `${newPath} ${formattedOwners}`;
  }
}

export class LinedUpFormatter extends LineFormatter {
  formatLine(line: string, maxLength: number): string {
    if (line.startsWith("#") || line.length === 0) {
      return line;
    }

    const [path, ...owners] = line.split(" ").filter(String);
    const newPath = path.padEnd(maxLength, " ");
    const formattedOwners = owners.join(" ");

    return `${newPath} ${formattedOwners}`;
  }
}

export class DoNothingFormatter extends LineFormatter {
  formatLine(line: string, _: number): string {
    return line;
  }
}

export function getAppropriateFormatter(formatType: string): LineFormatter {
  switch (formatType) {
    case "one-space":
      return new OneSpaceFormatter();
    case "lined-up":
      return new LinedUpFormatter();
    case "no-op":
      return new DoNothingFormatter();
    default:
      throw new Error(
        `Invalid format type: ${formatType}. Possible values are: one-space, lined-up, no-op`
      );
  }
}
