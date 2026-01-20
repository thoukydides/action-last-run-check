// GitHub action
// Copyright © 2026 Alexander Thoukydides

import { getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { isValidDate } from './utils.js';
import { readModifyRepoVariable } from './repo_variable.js';

// Script entry point
async function run() {
    // Action inputs
    const repoVariable  = core.getInput('repo_variable',    { required: true });
    const setDateISO    = core.getInput('set_date',         { required: false });
    const checkDateISO  = core.getInput('check_date',       { required: false });
    const token         = core.getInput('github_token',     { required: true });

    // Create an authenticated GitHub client
    const github = getOctokit(token);

    // Prepare the new last run date value
    const newLastRunDate = setDateISO ? parseISODate('set_date', setDateISO) : new Date();

    // Read and update the repository variable
    const oldLastRunDateISO = await readModifyRepoVariable(github, repoVariable, newLastRunDate.toISOString());
    const lastRunDate = oldLastRunDateISO ? parseISODate(repoVariable, oldLastRunDateISO) : undefined;

    // Primary action output
    core.setOutput('last_run_date', lastRunDate?.toISOString() ?? '');

    // If a check date was provided then compare it to the last run date
    if (checkDateISO) {
        const checkDate = parseISODate('check_date', checkDateISO);
        const isAfterLastRun = lastRunDate === undefined || lastRunDate < checkDate;
        core.setOutput('is_after_last_run', isAfterLastRun);
    }
}

// Parse a date from an ISO string, checking validity
function parseISODate(description: string, dateString: string): Date {
    const date = new Date(dateString);
    if (!isValidDate(date)) {
        throw new Error(`Invalid ${description} date string: ${dateString}`);
    }
    return date;
}

// Run the script and handle errors
try {
    await run();
} catch (err) {
    core.setFailed(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
    if (err instanceof Error && err.stack) core.debug(err.stack);
}