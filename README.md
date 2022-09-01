# format-codeowners

This repository holds the Action definition for formatting a `CODEOWNERS` file.

## Usage

### Example

```yaml
    - uses: Archetypically/format-codeowners@v1
      with:
        # Optional. The path to the CODEOWNERS file to format. Will auto-detect if not passed in.
        file-path: CODEOWNERS

        # Optional. The format style to use.
        # Available values:
        # - lined-up
        # - one-space
        # Default: lined-up
        format-style: lined-up

        # Optional. Whether or not to remove empty lines.
        remove-empty-lines: true
```

### Parameters

| Name | Description | Default |
| --- | --- | --- |
| `file-path` | The path to the CODEOWNERS file to format. Will auto-detect if not passed in. | `CODEOWNERS` |
| `format-style` | The format style to use. Available values: `lined-up`, `one-space`. | `lined-up` |
| `remove-empty-lines` | Whether or not to remove empty lines. | `false` |

#### Format styles examples

`lined-up`:

```
# this is a comment
path/to/file1.txt                                @user1 @user2
this/will/be/a/very/long/path/to/a/file/wow/long @user3 @user4
bare-file.txt                                    @user5
there/is/a/lot/of/white/space/here.txt           @user6 @user7 @user8
```

`one-space`:

```
# this is a comment
path/to/file1.txt @user1 @user2
this/will/be/a/very/long/path/to/a/file/wow/long @user3 @user4
bare-file.txt @user5
there/is/a/lot/of/white/space/here.txt @user6 @user7 @user8
```

### Committing changes

Note: this Action will not commit files back to the repository; you can use something like [`stefanzweifel/git-auto-commit-action@v4`](https://github.com/marketplace/actions/git-auto-commit).

```yaml
    - uses: stefanzweifel/git-auto-commit-action@v4
      with:
        # Optional. Commit message for the created commit.
        # Defaults to "Apply automatic changes"
        commit_message: Reformat CODEOWNERS

        # Optional. Options used by `git-commit`.
        # See https://git-scm.com/docs/git-commit#_options
        commit_options: '--no-verify --signoff'

        # Optional glob pattern of files which should be added to the commit
        # Defaults to all (.)
        # See the `pathspec`-documentation for git
        # - https://git-scm.com/docs/git-add#Documentation/git-add.txt-ltpathspecgt82308203
        # - https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefpathspecapathspec
        file_pattern: CODEOWNERS .github/CODEOWNERS docs/CODEOWNERS

        # Optional. Prevents the shell from expanding filenames.
        # Details: https://www.gnu.org/software/bash/manual/html_node/Filename-Expansion.html
        disable_globbing: true
```

## Development

Inputs are controlled via environment variables defined in `development/.env.development`.

Run the action using:

```shell
yarn action
```

which will operate on the file at `development/CODEOWNERS.unformatted`.

Run the tests using:

```shell
yarn test
```
