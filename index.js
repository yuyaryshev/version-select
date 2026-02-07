"use strict";
const fs = require('fs');
const cliSelect = require('cli-select');
const chalk = require('chalk');
const colors = require('colors');
const FILE = 'package.json';
const PATCH = "Patch";
const MINOR = "Minor";
const MAJOR = "Major";
const KEEP = "Keep";

const getAction = (question, values) => {
    console.log(question);
    const valueRenderer = (answer, selected) => (selected ? chalk.underline(answer) : answer);

    return new Promise((resolve) => {
        cliSelect({ values, valueRenderer}).then(({value}) => resolve(value));
    });
}

const getCurrentVersion = (fileData) => {
    return (fileData.version || "0.0.0").split('.').map(item => Number(item));
}

const getNewVersion = (version, action) => {
    switch (action) {
        case PATCH:
            version[2] += 1;
            break;
        case MINOR:
            version[1] += 1;
            version[2] = 0;
            break;
        case MAJOR:
            version[0] += 1;
            version[1] = 0;
            version[2] = 0;
            break;
        case KEEP:
            break;
    }

    return version.join('.');
}

const setNewVersion = async (fileData, version) => {
    return await fs.writeFileSync(FILE, JSON.stringify({...fileData, version}, null, 4));
}

const updateVersion = async () => {
    const fileData = JSON.parse(fs.readFileSync(FILE));
    const currentVersion = getCurrentVersion(fileData);
    const current = fileData.version;
    const action = await getAction('Semantic version:'.green, [
        `${PATCH} ${current} -> ${getNewVersion([...currentVersion], PATCH)}`,
        `${MINOR} ${current} -> ${getNewVersion([...currentVersion], MINOR)}`,
        `${MAJOR} ${current} -> ${getNewVersion([...currentVersion], MAJOR)}`,
        `${KEEP} ${current}`
    ]);
    const currentAction = action.split(' ')[0];

    if(currentAction == KEEP) return;

    const { size } = fs.statSync(FILE);
    if (!size) { return new Error('Incorrect path') }

    const newVersion = getNewVersion(currentVersion, currentAction);
    console.log(newVersion.yellow);
    return setNewVersion(fileData, newVersion);
}

module.exports = {
    getCurrentVersion,
    getNewVersion,
    updateVersion
};
