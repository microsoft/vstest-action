import * as glob from '@actions/glob';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import * as Search from '../src/search';
import {getInputs} from '../src/input-helper';
import {NoFileOptions} from '../src/constants';
import { run } from '../src/index';
import {stat} from 'fs';
import {uploadArtifact} from '../src/uploadArtifact';
import {getTestAssemblies} from '../src/getTestAssemblies';
import {getArguments} from '../src/getArguments';
import {getVsTestPath} from '../src/getVsTestPath';
import {when} from 'jest-when';

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
        const coreGetInputSpyOn = jest.spyOn(core, 'getInput');
        when(coreGetInputSpyOn).calledWith('testFiltercriteria').mockReturnValue('')
        .calledWith('runSettingsFile').mockReturnValue('')
        .calledWith('pathToCustomTestAdapters').mockReturnValue('')
        .calledWith('runInParallel').mockReturnValue('false')
        .calledWith('runTestsInIsolation').mockReturnValue('false')
        .calledWith('codeCoverageEnabled').mockReturnValue('false')
        .calledWith('platform').mockReturnValue('')
        .calledWith('otherConsoleOptions').mockReturnValue('');
    
        // Act
        var args = getArguments();
    
        // Assert
        expect(args).not.toBeNull();
        expect(args).toBe('');
    
    });

    it("test getArguments with all expected inputs", async () => {

        const expectedResult = '/TestCaseFilter:testFilterCriteria /Settings:runSettingsFile /TestAdapterPath:pathToCustomTestAdapters /Parallel /InIsolation /EnableCodeCoverage /Platform:x64 otherConsoleOptions '
        jest.mock('@actions/core');
        jest.spyOn(core,'debug');
        jest.spyOn(core, 'info');
        jest.spyOn(core, 'getInput');

        // Arrange
        const coreGetInputSpyOn = jest.spyOn(core, 'getInput');
        when(coreGetInputSpyOn).calledWith('testFiltercriteria').mockReturnValue('testFilterCriteria')
        .calledWith('runSettingsFile').mockReturnValue('runSettingsFile')
        .calledWith('pathToCustomTestAdapters').mockReturnValue('pathToCustomTestAdapters')
        .calledWith('runInParallel').mockReturnValue('true')
        .calledWith('runTestsInIsolation').mockReturnValue('true')
        .calledWith('codeCoverageEnabled').mockReturnValue('true')
        .calledWith('platform').mockReturnValue('x64')
        .calledWith('otherConsoleOptions').mockReturnValue('otherConsoleOptions');
    
        // Act
        var args = getArguments();
    
        // Assert
        expect(args).not.toBeNull();
        expect(args).toEqual(expectedResult);
    
    });

    it("test getTestAssemblies with valid searchResults", async () => {

        // Arrange
        const coreGetInputSpyOn = jest.spyOn(core, 'getInput');

        when(coreGetInputSpyOn).calledWith('searchFolder').mockReturnValue('folderPath\\')
        .calledWith('testAssembly').mockReturnValue('testFile.sln');

        const returnValue1 = core.getInput('searchFolder');
        const returnValue2 = core.getInput('testAssembly');

        var filesToUploadValue = ["testFile.zip"];
        var rootDirectoryValue = "C:\\Users\\Public\\";

        const searchResults = {
            filesToUpload: filesToUploadValue,
            rootDirectory: rootDirectoryValue
        };

        jest.mock('../src/search');
        const findFilesToUploadMock = jest.spyOn(Search, 'findFilesToUpload');
        when(findFilesToUploadMock).mockResolvedValue(searchResults);

        // Act
        var testAssembly = await getTestAssemblies();

        // Assert
        expect(testAssembly).not.toBeNull();

    });

    it("test getTestAssemblies with empty searchResults", async () => {

        // Arrange
        const coreGetInputSpyOn = jest.spyOn(core, 'getInput');

        when(coreGetInputSpyOn).calledWith('searchFolder').mockReturnValue('folderPath\\')
        .calledWith('testAssembly').mockReturnValue('testFile.sln');

        const returnValue1 = core.getInput('searchFolder');
        const returnValue2 = core.getInput('testAssembly');

        var filesToUploadValue = [''];
        var rootDirectoryValue = "C:\\Users\\Public\\";

        const searchResults = {
            filesToUpload: filesToUploadValue,
            rootDirectory: rootDirectoryValue
        };

        jest.mock('../src/search');
        const findFilesToUploadMock = jest.spyOn(Search, 'findFilesToUpload');
        when(findFilesToUploadMock).mockResolvedValue(searchResults);
        const expectedResult : string[] = new Array('');

        // Act
        var testAssembly = await getTestAssemblies();

        // Assert
        expect(testAssembly).toEqual(expectedResult);

    });

    it('getTestAssemblies throws exception', async () => {

        // Arrange
        const coreGetInputSpyOn = jest.spyOn(core, 'getInput');

        when(coreGetInputSpyOn).calledWith('searchFolder').mockReturnValue('folderPath\\')
        .calledWith('testAssembly').mockReturnValue('testFile.sln');

        const returnValue1 = core.getInput('searchFolder');
        const returnValue2 = core.getInput('testAssembly');

        var filesToUploadValue = [''];
        var rootDirectoryValue = "C:\\Users\\Public\\";

        const searchResults = {
            filesToUpload: filesToUploadValue,
            rootDirectory: rootDirectoryValue
        };

        jest.mock('../src/search');
        const findFilesToUploadMock = jest.spyOn(Search, 'findFilesToUpload');
        when(findFilesToUploadMock).mockImplementation(() => { throw new Error('Sample Error') });

        const coresStFailedSpyOn = jest.spyOn(core, 'setFailed');

        // Act
        var testAssembly = await getTestAssemblies();
        
        // Assert
        expect(testAssembly.length).toEqual(0);
    });

    // test('test getInputs with no input', async () => {
    //     let inputs = getInputs()
    //     expect(inputs.ifNoFilesFound)
    // });
    
    // test('test findFilesToUpload with empty searchFolder', async () => {
    //     var searchFolder = "" as string
    
    //     let result = await Search.findFilesToUpload(searchFolder)
    //     expect(result.filesToUpload).toBeNull
    // })
    
    // test('test findFilesToUpload', async () => {
    //     var searchFolder = process.env['RUNNER_SEARCH'] as string

    //     const expectedResult : string[] = new Array('');

    //     // jest.mock('fs');
    //     // jest.spyOn(stat.prototype, 'stats');
    
    //     let result = await Search.findFilesToUpload(searchFolder)
    //     expect(result.filesToUpload).toEqual(expectedResult);
    // })
    
    // test('vstest', async () => {
    //     await run()
    // })
});

