import * as glob from '@actions/glob';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import * as Search from '../src/search';
import {getInputs} from '../src/input-helper';
import {Inputs, NoFileOptions} from '../src/constants'
import { run } from '../src/index';
import {uploadArtifact} from '../src/uploadArtifact';
import {getTestAssemblies} from '../src/getTestAssemblies';
import {getArguments} from '../src/getArguments';
import {getVsTestPath} from '../src/getVsTestPath';
import {when} from 'jest-when';
import * as fs from 'fs'
// const fs = require('fs')

describe('vstest Action Unit Tests', ()=>{

    beforeEach(async() => {
        let workerUri = "https://aka.ms/local-worker-win-x64";
        // jest.resetModules();
        // jest.resetAllMocks();

        jest.mock('@actions/core');
        jest.spyOn(core,'debug');
        jest.spyOn(core, 'info');
        jest.spyOn(core, 'getInput');
        jest.spyOn(core, 'setFailed');
        jest.spyOn(core, 'warning');

        jest.mock('@actions/exec');
        jest.spyOn(exec, 'exec');

        jest.mock('path');


        // jest.mock('../src/uploadArtifact');
        
    });
    
    afterEach(async () => {
        jest.resetAllMocks
    })
    
    it("test getArguments with no inputs", async () => {

        jest.mock('@actions/core');
        jest.spyOn(core,'debug');
        jest.spyOn(core, 'info');
        jest.spyOn(core, 'getInput');

        // Arrange
        const coreGetInputMock = jest.spyOn(core, 'getInput');
        when(coreGetInputMock).calledWith('testFiltercriteria').mockReturnValue('')
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
        const coreGetInputMock = jest.spyOn(core, 'getInput');
        when(coreGetInputMock).calledWith('testFiltercriteria').mockReturnValue('testFilterCriteria')
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

    // it("test getTestAssemblies with valid searchResults", async () => {

    //     // Arrange
    //     const coreGetInputMock = jest.spyOn(core, 'getInput');

    //     when(coreGetInputMock).calledWith('searchFolder').mockReturnValue('folderPath\\')
    //     .calledWith('testAssembly').mockReturnValue('testFile.sln');

    //     const returnValue1 = core.getInput('searchFolder');
    //     const returnValue2 = core.getInput('testAssembly');

    //     var filesToUploadValue = ["testFile.zip"];
    //     var rootDirectoryValue = "C:\\Users\\Public\\";

    //     const searchResults = {
    //         filesToUpload: filesToUploadValue,
    //         rootDirectory: rootDirectoryValue
    //     };

    //     jest.mock('../src/search');
    //     const findFilesToUploadMock = jest.spyOn(Search, 'findFilesToUpload');
    //     when(findFilesToUploadMock).mockResolvedValue(searchResults);

    //     // Act
    //     var testAssembly = await getTestAssemblies();

    //     // Assert
    //     expect(testAssembly).not.toBeNull()
    //     findFilesToUploadMock.mockReset()
    // });

    it("test getTestAssemblies with empty searchResults", async () => {

        // Arrange
        const coreGetInputMock = jest.spyOn(core, 'getInput');

        when(coreGetInputMock).calledWith('searchFolder').mockReturnValue('folderPath\\')
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
        expect(testAssembly).toEqual(expectedResult)
        findFilesToUploadMock.mockReset()
    });

    it('getTestAssemblies throws exception', async () => {

        // Arrange
        const coreGetInputMock = jest.spyOn(core, 'getInput');

        when(coreGetInputMock).calledWith('searchFolder').mockReturnValue('folderPath\\')
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
        findFilesToUploadMock.mockRestore();
        
        // Assert
        expect(testAssembly.length).toEqual(0)
        findFilesToUploadMock.mockReset()
    })

    it('test getInputs with valid values', async () => {
        // Arrange
        const coreGetInputMock = jest.spyOn(core, 'getInput');
        const coreSetFailedMock = jest.spyOn(core, 'setFailed');
        when(coreGetInputMock)
        .calledWith(Inputs.Name).mockReturnValue('testFile.sln')
        .calledWith(Inputs.IfNoFilesFound).mockReturnValue('warn')
        .calledWith(Inputs.RetentionDays).mockReturnValue('30');
        
        // Act
        var results = getInputs();

        // Assert
        expect(results).not.toBeNull();

    });

    it('test getInputs with invalid RetentionDays', async () => {
        // Arrange
        const coreGetInputMock = jest.spyOn(core, 'getInput');
        const coreSetFailedMock = jest.spyOn(core, 'setFailed');
        when(coreGetInputMock)
        .calledWith(Inputs.Name).mockReturnValue('testFile.sln')
        .calledWith(Inputs.IfNoFilesFound).mockReturnValue('warn')
        .calledWith(Inputs.RetentionDays).mockReturnValue('xx');
        
        // Act
        var results = getInputs();

        // Assert
        expect(results).not.toBeNull();

    });
    
    it('test getInputs with ifNoFilesFound values', async () => {
        // Arrange
        const coreGetInputMock = jest.spyOn(core, 'getInput');
        const coreSetFailedMock = jest.spyOn(core, 'setFailed');
        when(coreGetInputMock)
        .calledWith(Inputs.Name).mockReturnValue('testFile.sln')
        .calledWith(Inputs.IfNoFilesFound).mockReturnValue('ifNoFilesFound')
        .calledWith(Inputs.RetentionDays).mockReturnValue('30');
        
        // Act
        var results = getInputs();

        // Assert
        expect(results).not.toBeNull();

    });

    it('test findFilesToUpload with valid values', async () => {
        // Arrange
        jest.mock('@actions/glob')
        const coreGetInputMock = jest.spyOn(core, 'getInput')
        const globCreateMock = jest.spyOn(glob, 'create')
        const fs = require('fs')
        const mocked = fs as jest.Mocked<typeof fs>

        jest.spyOn(fs, 'existsSync')
        fs.existsSync.mockReturnValue(false)
        const fsStatSyncMock = jest.spyOn(fs, 'statSync')
        when(fsStatSyncMock).calledWith().mockReturnValue(true)

        when(coreGetInputMock)
        .calledWith(Inputs.Name).mockReturnValue('testFile.sln')
        .calledWith(Inputs.IfNoFilesFound).mockReturnValue('warn')
        .calledWith(Inputs.RetentionDays).mockReturnValue('30')
        
        var searchFolder = "C:\\Temp\\" as string;

        var rawSearchResults = ["C:\\Temp\\Folder1","C:\\Temp\\Folder2","C:\\Temp\\Folder3"]
        
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        var globCreationResultMock = when(globCreateMock).calledWith(searchFolder,globOptions).mockReturnThis
        // var y = when(globCreationResultMock).calledWith().mockReturnValue(rawSearchResults)

        // Act
        var results = await Search.findFilesToUpload(searchFolder, globOptions)

        // Assert
        expect(results).not.toBeNull()

    });

    it('test findFilesToUpload with temp folder', async () => {
        // Arrange
        var searchFolder = "C:\\Temp\\branch1\\folder1\\vstest-functional-test.csproj C:\\Temp\\branch2\\folder2\\vstest-functional-test.csproj" as string
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        // Act
        let result = await Search.findFilesToUpload(searchFolder)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })
    
    it('test findFilesToUpload with non-existent folder', async () => {
        // Arrange
        var searchFolder = "" as string

        // Act
        let result = await Search.findFilesToUpload(searchFolder)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })


    it('test findFilesToUpload with temp subfolder', async () => {
        // Arrange
        var searchFolder = "C:\\Temp\\*\\*" as string
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        // Act
        let result = await Search.findFilesToUpload(searchFolder, globOptions)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })

    it('test findFilesToUpload with temp folder without glob options', async () => {
        // Arrange
        var searchFolder = "C:\\Temp\\folder1" as string
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        // Act
        let result = await Search.findFilesToUpload(searchFolder)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })

    it('test findFilesToUpload with zip file', async () => {
        // Arrange
        var searchFolder = "C:\\Temp\\testCase.zip" as string
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        // Act
        let result = await Search.findFilesToUpload(searchFolder, globOptions)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })

    it('test uploadArtifact', async () => {
        jest.mock('@actions/core');
        jest.spyOn(core,'debug');
        jest.spyOn(core, 'info');
        jest.spyOn(core, 'getInput');

        // Arrange
        const coreGetInputMock = jest.spyOn(core, 'getInput');
        when(coreGetInputMock).calledWith('testFiltercriteria').mockReturnValue('')
        .calledWith('runSettingsFile').mockReturnValue('')
        .calledWith('pathToCustomTestAdapters').mockReturnValue('')
        .calledWith('runInParallel').mockReturnValue('false')
        .calledWith('runTestsInIsolation').mockReturnValue('false')
        .calledWith('codeCoverageEnabled').mockReturnValue('false')
        .calledWith('platform').mockReturnValue('')
        .calledWith('otherConsoleOptions').mockReturnValue('');
    
        // Act
        var args = uploadArtifact();
    
        // Assert
        expect(args).not.toBeNull();
    
    });

    // it("test uploadArtifact with valid searchResults", async () => {

    //     // Arrange
    //     const coreGetInputMock = jest.spyOn(core, 'getInput');

    //     when(coreGetInputMock).calledWith('searchFolder').mockReturnValue('folderPath\\')
    //     .calledWith('testAssembly').mockReturnValue('testFile.sln');

    //     const returnValue1 = core.getInput('searchFolder');
    //     const returnValue2 = core.getInput('testAssembly');

    //     var filesToUploadValue = ["testFile.zip"];
    //     var rootDirectoryValue = "C:\\Users\\Public\\";

    //     const searchResults = {
    //         filesToUpload: filesToUploadValue,
    //         rootDirectory: rootDirectoryValue
    //     };

    //     jest.mock('../src/search');
    //     const findFilesToUploadMock = jest.spyOn(Search, 'findFilesToUpload');
    //     when(findFilesToUploadMock).mockResolvedValue(searchResults);

    //     // Act
    //     var testAssembly = await uploadArtifact();

    //     // Assert
    //     expect(testAssembly).not.toBeNull()
    //     findFilesToUploadMock.mockReset()
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

