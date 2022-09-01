import {
  OneSpaceFormatter,
  LinedUpFormatter,
  DoNothingFormatter,
  getAppropriateFormatter,
} from "../src/formatters";

describe("getAppropriateFormatter", () => {
  test("returns the correct formatter for the given format type", () => {
    expect(getAppropriateFormatter("one-space")).toBeInstanceOf(OneSpaceFormatter);
    expect(getAppropriateFormatter("lined-up")).toBeInstanceOf(LinedUpFormatter);
    expect(getAppropriateFormatter("no-op")).toBeInstanceOf(DoNothingFormatter);
  });

  test("throws an error if the format type is invalid", () => {
    expect(() => getAppropriateFormatter("invalid")).toThrowError("Invalid format type: invalid");
  });
});

describe("OneSpaceFormatter", () => {
  test("ignores comments", () => {
    const line = "# this is a        comment";
    const expected = "# this is a        comment";
    expect(new OneSpaceFormatter().formatLine(line, 0)).toEqual(expected);
  });

  test("formats the line correctly", () => {
    const line = "test1.txt         @test1";
    const expected = "test1.txt @test1";
    expect(new OneSpaceFormatter().formatLine(line, 0)).toEqual(expected);
  });
});

describe("LinedUpFormatter", () => {
  test("ignores comments", () => {
    const line = "# this is a        comment";
    const expected = "# this is a        comment";
    expect(new LinedUpFormatter().formatLine(line, 0)).toEqual(expected);
  });

  test("formats the line correctly", () => {
    const line = "test1.txt @test1";
    const expected = "test1.txt                 @test1";
    expect(new LinedUpFormatter().formatLine(line, 25)).toEqual(expected);
  });
});

describe("DoNothingFormatter", () => {
  test("formats the line correctly", () => {
    const line = "test1.txt                 @test1";
    const expected = "test1.txt                 @test1";
    expect(new DoNothingFormatter().formatLine(line, 0)).toEqual(expected);
  });
});
