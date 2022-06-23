import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import {create, UploadOptions} from '@actions/artifact';
import {findFilesToUpload} from './search';
import {getInputs} from './input-helper';
import {NoFileOptions} from './constants';

export function getArguments(): string {
  let args = ''
  let testFiltercriteria = core.getInput('testFiltercriteria')
  if(testFiltercriteria) {
    args += `/TestCaseFilter:${testFiltercriteria} `
  }

  let runSettingsFile = core.getInput('runSettingsFile')
  if(runSettingsFile) {
    args += `/Settings:${runSettingsFile} `
  }

  let pathToCustomTestAdapters = core.getInput('pathToCustomTestAdapters')
  if(pathToCustomTestAdapters) {
    args += `/TestAdapterPath:${pathToCustomTestAdapters} `
  }

  let runInParallel = core.getInput('runInParallel')
  if(runInParallel && runInParallel.toUpperCase() === "TRUE") {
    args += `/Parallel `
  }

  let runTestsInIsolation = core.getInput('runTestsInIsolation')
  if(runTestsInIsolation && runTestsInIsolation.toUpperCase() === "TRUE") {
    args += `/InIsolation `
  }

  let codeCoverageEnabled = core.getInput('codeCoverageEnabled')
  if(codeCoverageEnabled && codeCoverageEnabled.toUpperCase() === "TRUE") {
    args += `/EnableCodeCoverage `
  }

  let platform = core.getInput('platform')
  if(platform && (platform === "x86" || platform === "x64" || platform === "ARM")) {
    args += `/Platform:${platform} `
  }

  let otherConsoleOptions = core.getInput('otherConsoleOptions')
  if(otherConsoleOptions) {
    args += `${otherConsoleOptions} `
  }

  return args
}

