import * as fs from "fs";

import { jest } from "@jest/globals";
import * as core from "@actions/core";

import { getFileContents, formatContents, main } from "../src/index";
import { LineFormatter } from "../src/formatters";

const TEST_CODEOWNERS_FILE_CONTENTS = String(
  "# this is a comment and should    be ignored\n" +
    "path/to/file1.txt @user1 @user2\n" +
    "this/will/be/a/very/long/path/to/a/file/wow/long @user3 @user4\n" +
    "\n" +
    "bare-file.txt @user5\n" +
    "\n" +
    "\n" +
    "\n" +
    "there/is/a/lot/of/white/space/here.txt              @user6              @user7                      @user8\n"
);

beforeAll(() => {
  jest.spyOn(core, "debug").mockImplementation(() => {});
  jest.spyOn(core, "info").mockImplementation(() => {});
  jest.spyOn(core, "error").mockImplementation(() => {});
  jest.spyOn(core, "notice").mockImplementation(() => {});
  jest.spyOn(core, "setOutput").mockImplementation(() => {});
  jest.spyOn(core, "setFailed").mockImplementation(() => {});
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe("getFileContents", () => {
  describe("when filePath is specified", () => {
    test("and the file does not exist", () => {
      const mockGetInput = jest.spyOn(core, "getInput");
      mockGetInput.mockReturnValueOnce("does-not-exist");

      expect(getFileContents()).toEqual([]);
    });

    test("and the file exists", () => {
      const mockGetInput = jest.spyOn(core, "getInput");
      mockGetInput.mockReturnValueOnce("test/fixtures/CODEOWNERS.unformatted");

      expect(getFileContents()).toEqual([
        {
          path: "test/fixtures/CODEOWNERS.unformatted",
          contents: TEST_CODEOWNERS_FILE_CONTENTS,
        },
      ]);
    });
  });

  describe("when filePath is not specified", () => {
    test("and none of the files exist", () => {
      const mockGetInput = jest.spyOn(core, "getInput");
      mockGetInput.mockReturnValueOnce("");
      expect(getFileContents([])).toEqual([]);
    });

    test("and one of the files exists", () => {
      const mockGetInput = jest.spyOn(core, "getInput");
      mockGetInput.mockReturnValueOnce("");
      expect(getFileContents(["test/fixtures/CODEOWNERS.unformatted"])).toEqual([
        {
          path: "test/fixtures/CODEOWNERS.unformatted",
          contents: String(
            "# this is a comment and should    be ignored\n" +
              "path/to/file1.txt @user1 @user2\n" +
              "this/will/be/a/very/long/path/to/a/file/wow/long @user3 @user4\n" +
              "\n" +
              "bare-file.txt @user5\n" +
              "\n" +
              "\n" +
              "\n" +
              "there/is/a/lot/of/white/space/here.txt              @user6              @user7                      @user8\n"
          ),
        },
      ]);
    });

    test("and multiple of the files exists", () => {
      const mockGetInput = jest.spyOn(core, "getInput");
      mockGetInput.mockReturnValueOnce("");
      expect(
        getFileContents([
          "test/fixtures/CODEOWNERS.unformatted",
          "test/fixtures/CODEOWNERS.unformatted",
        ])
      ).toEqual([
        {
          path: "test/fixtures/CODEOWNERS.unformatted",
          contents: TEST_CODEOWNERS_FILE_CONTENTS,
        },
        {
          path: "test/fixtures/CODEOWNERS.unformatted",
          contents: TEST_CODEOWNERS_FILE_CONTENTS,
        },
      ]);
    });
  });
});

describe("formatContents", () => {
  class FakeFormatter extends LineFormatter {
    formatLine(line: string, _maxLength: number) {
      return line;
    }
  }

  test("does nothing to comments or blank lines", () => {
    expect(
      formatContents(
        new FakeFormatter(),
        {
          path: "CODEOWNERS",
          contents: "# this is a comment and should    be ignored\n\n",
        },
        false
      )
    ).toEqual({
      path: "CODEOWNERS",
      contents: "# this is a comment and should    be ignored\n\n",
    });
  });

  describe("properly calls the formatter", () => {
    test("when there is only one line", () => {
      expect(
        formatContents(new FakeFormatter(), {
          path: "CODEOWNERS",
          contents: "test1.txt @test1\n",
        })
      ).toEqual({
        path: "CODEOWNERS",
        contents: "test1.txt @test1\n",
      });
    });

    describe("when there are multiple lines", () => {
      test("ensuring we'll add a newline", () => {
        expect(
          formatContents(new FakeFormatter(), {
            path: "CODEOWNERS",
            contents: String(`test1.txt @test1\npath/to/folder @test2`),
          })
        ).toEqual({
          path: "CODEOWNERS",
          contents: String(`test1.txt @test1\npath/to/folder @test2\n`),
        });
      });

      test("ensuring we won't add an extra newline", () => {
        expect(
          formatContents(new FakeFormatter(), {
            path: "CODEOWNERS",
            contents: String(`test1.txt @test1\npath/to/folder @test2`),
          })
        ).toEqual({
          path: "CODEOWNERS",
          contents: String(`test1.txt @test1\npath/to/folder @test2\n`),
        });
      });

      test("ensuring we will remove empty lines if requested", () => {
        expect(
          formatContents(
            new FakeFormatter(),
            {
              path: "CODEOWNERS",
              contents: String(`test1.txt @test1\n\n\n\n\n\n\npath/to/folder @test2`),
            },
            true
          )
        ).toEqual({
          path: "CODEOWNERS",
          contents: String(`test1.txt @test1\npath/to/folder @test2\n`),
        });
      });
    });
  });
});

describe("main", () => {
  test("properly formats using one-space", () => {
    const mockGetInput = jest.spyOn(core, "getInput");
    mockGetInput.mockReturnValueOnce("test/fixtures/CODEOWNERS.unformatted");
    mockGetInput.mockReturnValueOnce("one-space");

    const mockSetOutput = jest.spyOn(core, "setOutput");

    main();

    const unformattedContents = fs.readFileSync("test/fixtures/CODEOWNERS", "utf8");
    const formattedContents = fs.readFileSync("test/fixtures/CODEOWNERS.one-space", "utf8");
    expect(unformattedContents).toEqual(formattedContents);
    expect(mockSetOutput).toHaveBeenCalledWith(
      "formatted-files",
      "test/fixtures/CODEOWNERS.unformatted"
    );
  });

  test("properly formats using lined-up", () => {
    const mockGetInput = jest.spyOn(core, "getInput");
    mockGetInput.mockReturnValueOnce("test/fixtures/CODEOWNERS.unformatted");
    mockGetInput.mockReturnValueOnce("lined-up");

    const mockSetOutput = jest.spyOn(core, "setOutput");

    main();

    const unformattedContents = fs.readFileSync("test/fixtures/CODEOWNERS", "utf8");
    const formattedContents = fs.readFileSync("test/fixtures/CODEOWNERS.lined-up", "utf8");
    expect(unformattedContents).toEqual(formattedContents);

    expect(mockSetOutput).toHaveBeenCalledWith(
      "formatted-files",
      "test/fixtures/CODEOWNERS.unformatted"
    );
  });

  test("properly formats using remove-empty-lines", () => {
    const mockGetInput = jest.spyOn(core, "getInput");
    mockGetInput.mockReturnValueOnce("test/fixtures/CODEOWNERS.unformatted");
    mockGetInput.mockReturnValueOnce("one-space");
    mockGetInput.mockReturnValueOnce("true");

    const mockSetOutput = jest.spyOn(core, "setOutput");

    main();

    const unformattedContents = fs.readFileSync("test/fixtures/CODEOWNERS", "utf8");
    const formattedContents = fs.readFileSync(
      "test/fixtures/CODEOWNERS.one-space.no-empty",
      "utf8"
    );
    expect(unformattedContents).toEqual(formattedContents);
    expect(mockSetOutput).toHaveBeenCalledWith(
      "formatted-files",
      "test/fixtures/CODEOWNERS.unformatted"
    );
  });
});

describe("error handling", () => {
  test("when no CODEOWNERS are found", () => {
    if (fs.existsSync("CODEOWNERS")) {
      fs.unlinkSync("CODEOWNERS");
    }

    const mockSetOutput = jest.spyOn(core, "setOutput");
    const mockSetFailed = jest.spyOn(core, "setFailed");

    main();

    expect(mockSetOutput).toHaveBeenCalledWith("success", false);
    expect(mockSetFailed).toHaveBeenCalled();
  });

  test("when the formatter is not found", () => {
    const mockGetInput = jest.spyOn(core, "getInput");
    mockGetInput.mockReturnValueOnce("test/fixtures/CODEOWNERS.unformatted");
    mockGetInput.mockReturnValueOnce("not-a-formatter");

    const mockSetOutput = jest.spyOn(core, "setOutput");
    const mockSetFailed = jest.spyOn(core, "setFailed");

    main();

    expect(mockSetOutput).toHaveBeenCalledWith("success", false);
    expect(mockSetFailed).toHaveBeenCalled();
  });
});
