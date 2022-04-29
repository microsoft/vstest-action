import * as glob from '@actions/glob'
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import {findFilesToUpload} from '../src/search';
import {getInputs} from '../src/input-helper';
import {NoFileOptions} from '../src/constants';
import { run } from '../src/index'
import {uploadArtifact} from '../src/uploadArtifact'
import {getTestAssemblies} from '../src/getTestAssemblies'
import {getArguments} from '../src/getArguments'
import {getVsTestPath} from '../src/getVsTestPath'

describe('vstest Action Unit Tests', ()=>{

    beforeEach(async() => {
        let workerUri = "https://aka.ms/local-worker-win-x64";

        jest.mock('@actions/core');
        jest.spyOn(core,'debug');
        jest.spyOn(core, 'info');
        jest.spyOn(core, 'getInput');
        jest.spyOn(core, 'setFailed');
        jest.spyOn(core, 'warning');

        jest.mock('@actions/exec');
        jest.spyOn(exec, 'exec');

        jest.mock('path');


        jest.mock('../src/uploadArtifact');
        
    });

    it("test getArguments with all expected inputs", async () => {

        jest.mock('@actions/core');
        jest.spyOn(core,'debug');
        jest.spyOn(core, 'info');
        jest.spyOn(core, 'getInput');

        // Arrange
        const coreMock = jest.spyOn(core, 'getInput');
        
        coreMock.mockImplementation((arg: string) => 'testFiltercriteria').mockReturnValue('testFilterCriteria');
        coreMock.mockImplementation((arg: string) => 'runSettingsFile').mockReturnValue('runSettingsFile');
        coreMock.mockImplementation((arg: string) => 'pathtoCustomTestAdapters').mockReturnValue('pathtoCustomTestAdapters');
        coreMock.mockImplementation((arg: string) => 'runInParallel').mockReturnValue('true');
        coreMock.mockImplementation((arg: string) => 'runTestsInIsolation').mockReturnValue('true');
        coreMock.mockImplementation((arg: string) => 'codeCoverageEnabled').mockReturnValue('true');
        coreMock.mockImplementation((arg: string) => 'platform').mockReturnValue('x64');
        coreMock.mockImplementation((arg: string) => 'otherConsoleOptions').mockReturnValue('otherConsoleOptions');
    
        // Act
        var args = getArguments();
    
        // Assert
        expect(args).not.toBeNull();
    
    });
});


test('test getInputs with no input', async () => {
    let inputs = getInputs()
    expect(inputs.ifNoFilesFound)
})

test('test findFilesToUpload with empty searchFolder', async () => {
    var searchFolder = "" as string

    let result = findFilesToUpload(searchFolder)
    expect((await result).filesToUpload).toBeNull
})

test('test findFilesToUpload', async () => {
    var searchFolder = process.env['RUNNER_SEARCH'] as string

    let result = findFilesToUpload(searchFolder)
    expect((await result).filesToUpload).toHaveLength(2)
})

test('vstest', async () => {
    await run()
})
