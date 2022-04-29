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


    it("test getArguments with no inputs", async () => {

        jest.mock('@actions/core');
        jest.spyOn(core,'debug');
        jest.spyOn(core, 'info');
        jest.spyOn(core, 'getInput');

        // Arrange
        const coreMock = jest.spyOn(core, 'getInput');
        coreMock.mockImplementation((arg: string) => 'testFiltercriteria').mockReturnValueOnce('');
        coreMock.mockImplementation((arg: string) => 'runSettingsFile').mockReturnValueOnce('');
        coreMock.mockImplementation((arg: string) => 'pathtoCustomTestAdapters').mockReturnValueOnce('');
        coreMock.mockImplementation((arg: string) => 'runInParallel').mockReturnValueOnce('false');
        coreMock.mockImplementation((arg: string) => 'runTestsInIsolation').mockReturnValueOnce('false');
        coreMock.mockImplementation((arg: string) => 'codeCoverageEnabled').mockReturnValueOnce('false');
        coreMock.mockImplementation((arg: string) => 'platform').mockReturnValueOnce('');
        coreMock.mockImplementation((arg: string) => 'otherConsoleOptions').mockReturnValueOnce('');
    
        // Act
        var args = getArguments();
    
        // Assert
        expect(args).not.toBeNull();
        expect(args).toBe('');
    
    });

    it("test getArguments with all expected inputs", async () => {

        const expectedResult = '/TestCaseFilter:testFilterCriteria /Settings:runSettingsFile /TestAdapterPath:pathtoCustomTestAdapters /Parallel /InIsolation /Enablecodecoverage /Platform:x64 otherConsoleOptions '
        jest.mock('@actions/core');
        jest.spyOn(core,'debug');
        jest.spyOn(core, 'info');
        jest.spyOn(core, 'getInput');

        // Arrange
        const coreMock = jest.spyOn(core, 'getInput');
        coreMock.mockImplementation((arg: string) => 'testFiltercriteria').mockReturnValueOnce('testFilterCriteria');
        coreMock.mockImplementation((arg: string) => 'runSettingsFile').mockReturnValueOnce('runSettingsFile');
        coreMock.mockImplementation((arg: string) => 'pathtoCustomTestAdapters').mockReturnValueOnce('pathtoCustomTestAdapters');
        coreMock.mockImplementation((arg: string) => 'runInParallel').mockReturnValueOnce('true');
        coreMock.mockImplementation((arg: string) => 'runTestsInIsolation').mockReturnValueOnce('true');
        coreMock.mockImplementation((arg: string) => 'codeCoverageEnabled').mockReturnValueOnce('true');
        coreMock.mockImplementation((arg: string) => 'platform').mockReturnValueOnce('x64');
        coreMock.mockImplementation((arg: string) => 'otherConsoleOptions').mockReturnValueOnce('otherConsoleOptions');
    
        // Act
        var args = getArguments();
    
        // Assert
        expect(args).not.toBeNull();
        expect(args).toEqual(expectedResult);
    
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
