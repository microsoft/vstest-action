import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import {create, UploadOptions} from '@actions/artifact';
import {findFilesToUpload} from './search';
import {getInputs} from './input-helper';
import {NoFileOptions} from './constants';

async function uploadArtifact() {
  try {
    const inputs = getInputs()
    const searchResult = await findFilesToUpload(inputs.searchPath)
    if (searchResult.filesToUpload.length === 0) {
      // No files were found, different use cases warrant different types of behavior if nothing is found
      switch (inputs.ifNoFilesFound) {
        case NoFileOptions.warn: {
          core.warning(
            `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
          )
          break
        }
        case NoFileOptions.error: {
          core.setFailed(
            `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
          )
          break
        }
        case NoFileOptions.ignore: {
          core.info(
            `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
          )
          break
        }
      }
    } else {
      const s = searchResult.filesToUpload.length === 1 ? '' : 's'
      core.info(
        `With the provided path, there will be ${searchResult.filesToUpload.length} file${s} uploaded`
      )
      core.debug(`Root artifact directory is ${searchResult.rootDirectory}`)

      if (searchResult.filesToUpload.length > 10000) {
        core.warning(
          `There are over 10,000 files in this artifact, consider create an archive before upload to improve the upload performance.`
        )
      }

      const artifactClient = create()
      const options: UploadOptions = {
        continueOnError: false
      }
      if (inputs.retentionDays) {
        options.retentionDays = inputs.retentionDays
      }

      const uploadResponse = await artifactClient.uploadArtifact(
        inputs.artifactName,
        searchResult.filesToUpload,
        searchResult.rootDirectory,
        options
      )

      if (uploadResponse.failedItems.length > 0) {
        core.setFailed(
          `An error was encountered when uploading ${uploadResponse.artifactName}. There were ${uploadResponse.failedItems.length} items that failed to upload.`
        )
      } else {
        core.info(
          `Artifact ${uploadResponse.artifactName} has been successfully uploaded!`
        )
      }
    }
  } catch (err) {
    core.setFailed(err.message)
  }
}

async function getTestAssemblies(): Promise<string[]> {
  try {
    let searchFolder = core.getInput('searchFolder')
    let testAssembly = core.getInput('testAssembly')

    core.debug(`Pattern to search test assemblies: ${searchFolder + testAssembly}`)
    const searchResult = await findFilesToUpload(searchFolder + testAssembly)
    
    return searchResult.filesToUpload
  } catch (err) {
    core.setFailed(err.message)
  }
  return []
}

function getArguments(): string {
  let args = ''
  let testFiltercriteria = core.getInput('testFiltercriteria')
  if(testFiltercriteria) {
    args += `/TestCaseFilter:${testFiltercriteria} `
  }

  let runSettingsFile = core.getInput('runSettingsFile')
  if(runSettingsFile) {
    args += `/Settings:${runSettingsFile} `
  }

  let pathtoCustomTestAdapters = core.getInput('pathtoCustomTestAdapters')
  if(pathtoCustomTestAdapters) {
    args += `/TestAdapterPath:${pathtoCustomTestAdapters} `
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
    args += `/Enablecodecoverage `
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

function getVsTestPath(): string {
  let vstestLocationMethod = core.getInput('vstestLocationMethod')
  if(vstestLocationMethod && vstestLocationMethod.toUpperCase() === "LOCATION") {
    return core.getInput('vstestLocation')
  }

  let vsTestVersion = core.getInput('vsTestVersion')
  if(vsTestVersion && vsTestVersion === "14.0") {
    return path.join(__dirname, 'win-x64/VsTest/v140/vstest.console.exe')
  }

  if(vsTestVersion && vsTestVersion === "15.0") {
    return path.join(__dirname, 'win-x64/VsTest/v150/Common7/IDE/Extensions/TestPlatform/vstest.console.exe')
  }

  return path.join(__dirname, 'win-x64/VsTest/v160/Common7/IDE/Extensions/TestPlatform/vstest.console.exe')
}

export async function run() {
  try {
    let testFiles = await getTestAssemblies();
    if(testFiles.length == 0) {
      throw new Error('No matched test files!')
    }

    core.debug(`Matched test files are:`)
    testFiles.forEach(function (file) {
      core.debug(`${file}`)
    });

    core.info(`Downloading test tools...`);
    let workerZipPath = path.join(__dirname, 'win-x64.zip')
    await exec.exec(`powershell Invoke-WebRequest -Uri "https://aka.ms/local-worker-win-x64" -OutFile ${workerZipPath}`);

    core.info(`Unzipping test tools...`);
    core.debug(`workerZipPath is ${workerZipPath}`);
    await exec.exec(`powershell Expand-Archive -Path ${workerZipPath} -DestinationPath ${__dirname}`);

    let vsTestPath = getVsTestPath();
    core.debug(`VsTestPath: ${vsTestPath}`);

    let args = getArguments();
    core.debug(`Arguments: ${args}`);

    core.info(`Running tests...`);
    await exec.exec(`${vsTestPath} ${testFiles.join(' ')} ${args} /Logger:TRX`);
  } catch (err) {
    core.setFailed(err.message)
  }

  // Always attempt to upload test result artifact
  try {
    await uploadArtifact();
  } catch (err) {
    core.setFailed(err.message)
  }
}

run()