# `action-last-run-check`

This action uses a repository variable to store the date that a workflow was last run. The variable is created if it does not already exist. The action can also compare a provided date against the stored value (*before* the action updates it).

> [!CAUTION]
> This action is provided for my own use and published in case it is useful to others. If you rely on it, fork and maintain your own copy. No support or stability guarantees are offered.

## Prerequisites

Before using this workflow, ensure:
- The workflow has `actions: write` permission (either via the default `GITHUB_TOKEN` or a fine-grained token).

## Inputs

Various inputs are defined in the action to configure its operation:

| Name | Description | Default
| --- | --- | ---
| `repo_variable` | The name of the repository variable used to store the last run date | *required*
| `set_date` | Date (ISO format) to set as the last run date | *current date/time*
| `check_date` | A specific date (ISO format) to compare against the last run date |
| `github_token` | The GitHub token used to create an authenticated client | `${{ github.token }}`

## Outputs

The action provides the following outputs:

| Name | Description
| --- | ---
| `last_run_date` | The date (ISO format) of the last run of the workflow (empty string if never run)
| `is_after_last_run` | Whether the check_date is strictly after the last run date (true if never run, not set if no check_date provided)

## Usage

Example workflow to check whether the repository has been updated since the last check:

```yaml
name: Repository Updated?
permissions:
  actions: write

on:
  workflow_dispatch:

jobs:
  repository-updated:
    runs-on: ubuntu-latest

    steps:
      - name: Retrieve the repo's last update date
        id: context
        uses: actions/github-script@v7
        with:
          script: | # javascript
            const { owner, repo } = context.repo;
            const result = await github.rest.repos.get({ owner, repo });
            return result.data.updated_at;

      - name: Check date of the last workflow run
        id: last
        uses: thoukydides/action-last-run-check@v1
        with:
          repo_variable: LAST_REPO_UPDATED_RUN
          set_date: ${{ steps.context.outputs.result }}
          check_date: ${{ steps.context.outputs.result }}

      - name: Take action if the repo has been updated
        if: steps.last.outputs.is_after_last_run == 'true'
        env:
          UPDATE: |
            Repo updated at ${{ steps.context.outputs.result }}
            Previous update was as ${{ steps.last.last_run_date }}
        run: | # shell
          printf '%s' "$UPDATE" >> "$GITHUB_STEP_SUMMARY"
```

> [!TIP]
> This workflow sets `set_date` and `check_date` to the same value to ensure that any updates to the repo during the workflow's execution are caught on the next run.

## ISC License (ISC)

<details>
<summary>Copyright © 2026 Alexander Thoukydides</summary>

> Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
</details>