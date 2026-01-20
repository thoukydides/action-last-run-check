// GitHub action
// Copyright © 2026 Alexander Thoukydides

import { context } from '@actions/github';
import { GitHub } from '@actions/github/lib/utils.js';
import { RequestError } from '@octokit/request-error';
import * as core from '@actions/core';

// Read and optionally modify the value of a repository variable
export async function readModifyRepoVariable(
    github:     InstanceType<typeof GitHub>,
    name:       string,
    newValue?:  string
): Promise<string | undefined> {
    // Attempt to read the variable
    let oldValue: string | undefined;
    try {
        oldValue = (await github.rest.actions.getRepoVariable({ ...context.repo, name })).data.value;
        core.info(`Retrieved repository variable "${name}" = "${oldValue}"`);
    } catch (err) {
        // Ignore not found errors (variable does not exist yet)
        if (err instanceof RequestError && err.status === 404) {
            core.info(`Repository variable "${name}" does not exist`);
        } else throw err;
    }

    // If a new value is provided then create or update the variable
    if (newValue !== undefined) {
        if (newValue === oldValue) {
            core.info(`Repository variable "${name}" = "${newValue}"; no update needed`);
        } else if (oldValue === undefined) {
            await github.rest.actions.createRepoVariable({ ...context.repo, name, value: newValue });
            core.info(`Created repository variable "${name}" = "${newValue}"`);
        } else {
            await github.rest.actions.updateRepoVariable({ ...context.repo, name, value: newValue });
            core.info(`Updated repository variable "${name}" = "${newValue}"`);
        }
    }

    // Return the old value (or undefined if not set)
    return oldValue;
}