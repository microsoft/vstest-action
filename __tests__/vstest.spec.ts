import {create, UploadOptions,UploadResponse} from '@actions/artifact'
import * as glob from '@actions/glob'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'
import * as Search from '../src/search'
import {getInputs} from '../src/input-helper'
import {Inputs, NoFileOptions} from '../src/constants'
import { run } from '../src/index'
import {uploadArtifact} from '../src/uploadArtifact'
import {getTestAssemblies} from '../src/getTestAssemblies'
import {getArguments} from '../src/getArguments'
import {getVsTestPath} from '../src/getVsTestPath'
import {when} from 'jest-when'
import mock from 'mock-fs'
import * as fs from 'fs'
import { stringify } from 'querystring'
import { DirectoryItem } from 'mock-fs/lib/filesystem'

describe('vstest Action Unit Tests', ()=>{

  beforeEach(async() => {
      jest.mock('@actions/core');
      jest.spyOn(core,'debug');
      jest.spyOn(core, 'info');
      jest.spyOn(core, 'getInput');
      jest.spyOn(core, 'setFailed');
      jest.spyOn(core, 'warning');

      const globOptions : glob.GlobOptions = 
      {
          followSymbolicLinks:false,
          implicitDescendants: true,
          omitBrokenSymbolicLinks: true
      }        
    })
  
  afterEach(async () => {
      jest.resetAllMocks()
  })
   
  // it('test filesToUpload with large number of files', async () => {
  //   // Arrange
  //   const maximumFilesToUploadLimit = 10000 + 1
  //   const filesToUploadValue: string[] = new Array(maximumFilesToUploadLimit);
  //   const rootDirectoryValue = __dirname;

  //   jest.mock('fs')
  //   mock({
  //         // Recursively loads all node_modules
  //       'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
  //       'tempFolder': {
  //           'A.txt': '# Hello world!',                
  //           'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
  //           namespace SimpleTestProject
  //           {
  //               [TestClass]
  //               public class UnitTest1
  //               {
  //                   [TestMethod]
  //                   public void TestMethod1()
  //                   {
  //                   }
  //               }
  //           }`,
  //           'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

  //           <PropertyGroup>
  //             <TargetFramework>net6.0</TargetFramework>
  //             <Nullable>enable</Nullable>
          
  //             <IsPackable>false</IsPackable>
  //           </PropertyGroup>
          
  //           <ItemGroup>
  //             <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
  //             <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
  //             <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
  //             <PackageReference Include="coverlet.collector" Version="3.1.0" />
  //           </ItemGroup>
          
  //         </Project>`
  //       }
  //   })

  //   for(var i = 0; i < filesToUploadValue.length; i++) {
  //     var filename: string = path.resolve(__dirname, i.toString() + ".txt" )
  //     filesToUploadValue[i] = filename
  //     mock({ filename : i.toString() });
  //   }

  //   const coreGetInputMock = jest.spyOn(core, 'getInput');
  //   when(coreGetInputMock)
  //   .calledWith(Inputs.Name).mockReturnValue('vstest-functional-test.csproj')
  //   // .calledWith(Inputs.IfNoFilesFound).mockReturnValue(a)
  //   .calledWith(Inputs.RetentionDays).mockReturnValue('30');

  //   jest.spyOn(core, 'warning')
  //   jest.spyOn(core, 'info')
  //   jest.spyOn(core, 'setFailed')

  //   const searchResults = {
  //       filesToUpload: filesToUploadValue,
  //       rootDirectory: rootDirectoryValue
  //   };

  //   // jest.mock('../src/search');
  //   // const findFilesToUploadMock = jest.spyOn(Search, 'findFilesToUpload');
  //   // when(findFilesToUploadMock).mockResolvedValue(searchResults);

  //   var uploadResponse: UploadResponse = {
  //     artifactName: 'test',
  //     artifactItems: [],
  //     size: 0,
  //     failedItems: []
  //   };

  //   // jest.createMockFromModule('../src/uploadArtifact');
  //   // jest.mock('../src/uploadArtifact');

  //   // const artifactClient = {
  //   //   create: jest.fn(),
  //   //   uploadArtifact: uploadResponse
  //   // }
    
  //   // const artifactClientMock = when(create).mockReturnThis
  //   // when(artifactClientMock.call(uploadArtifact)).mockReturnValue(uploadResponse)


  //   // Act
  //   uploadArtifact();

  //   // Assert
  //   expect(core.warning).toBeCalled
  //   mock.restore
  // })

  it('test filesToUpload with valid filenames', async () => {
      // Arrange
      const expectFiles:string[] = [
        "C:\\Source\\Repos\\vstest-action\\tempFolder\\A.txt",
        "C:\\Source\\Repos\\vstest-action\\tempFolder\\Program.cs",
        "C:\\Source\\Repos\\vstest-action\\tempFolder\\vstest-functional-test.csproj"
    ] 
      jest.mock('fs')
      mock({
            // Recursively loads all node_modules
          'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
          'tempFolder': {
              'A.txt': '# Hello world!',                
              'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
              namespace SimpleTestProject
              {
                  [TestClass]
                  public class UnitTest1
                  {
                      [TestMethod]
                      public void TestMethod1()
                      {
                      }
                  }
              }`,
              'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

              <PropertyGroup>
                <TargetFramework>net6.0</TargetFramework>
                <Nullable>enable</Nullable>
            
                <IsPackable>false</IsPackable>
              </PropertyGroup>
            
              <ItemGroup>
                <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
                <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
                <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
                <PackageReference Include="coverlet.collector" Version="3.1.0" />
              </ItemGroup>
            
            </Project>`
          }
      })

      var searchFolder = "tempFolder" as string

      // Act
      let result = await Search.findFilesToUpload(searchFolder)

      // Assert        
      expect(result.filesToUpload).toEqual(expectFiles)
      mock.restore()
  })

  it('test filesToUpload with filenames that conflict', async () => {
      // Arrange
      const expectFiles:string[] = [
          "C:\\Source\\Repos\\vstest-action\\tempFolder\\A.txt",
          "C:\\Source\\Repos\\vstest-action\\tempFolder\\Program.cs",
          "C:\\Source\\Repos\\vstest-action\\tempFolder\\a.txt",
          "C:\\Source\\Repos\\vstest-action\\tempFolder\\vstest-functional-test.csproj"
      ] 
      jest.mock('fs')
      mock({
            // Recursively loads all node_modules
          'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
          'tempFolder': {
              'A.txt': '# Hello world!',                
              'a.txt': '# hello world!',
              'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
              namespace SimpleTestProject
              {
                  [TestClass]
                  public class UnitTest1
                  {
                      [TestMethod]
                      public void TestMethod1()
                      {
                      }
                  }
              }`,
              'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

              <PropertyGroup>
                <TargetFramework>net6.0</TargetFramework>
                <Nullable>enable</Nullable>
            
                <IsPackable>false</IsPackable>
              </PropertyGroup>
            
              <ItemGroup>
                <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
                <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
                <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
                <PackageReference Include="coverlet.collector" Version="3.1.0" />
              </ItemGroup>
            
            </Project>`
          }
      })

      var searchFolder = "tempFolder" as string
      const globOptions : glob.GlobOptions = 
      {
          followSymbolicLinks:false,
          implicitDescendants: false,
          omitBrokenSymbolicLinks: false
      }

      // Act
      let result = await Search.findFilesToUpload(searchFolder)

      // Assert        
      expect(result.filesToUpload).toEqual(expectFiles)
      mock.restore()
  })
  
  it('test filesToUpload with complex search folder', async () => {
      // Arrange
      const expectFiles:string[] = [
          "C:\\Source\\Repos\\vstest-action\\base1\\folder1\\A.txt",
          "C:\\Source\\Repos\\vstest-action\\base1\\folder1\\Program.cs",
          "C:\\Source\\Repos\\vstest-action\\base1\\folder1\\vstest-functional-test.csproj",
          "C:\\Source\\Repos\\vstest-action\\base2\\folder2\\A.txt",
          "C:\\Source\\Repos\\vstest-action\\base2\\folder2\\Program.cs",
          "C:\\Source\\Repos\\vstest-action\\base2\\folder2\\vstest-functional-test.csproj"
      ] 
      jest.mock('fs')
      mock({
            // Recursively loads all node_modules
          'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
          'base1/folder1/': {
              'A.txt': '# Hello world!',                
              'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
              namespace SimpleTestProject
              {
                  [TestClass]
                  public class UnitTest1
                  {
                      [TestMethod]
                      public void TestMethod1()
                      {
                      }
                  }
              }`,
              'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

              <PropertyGroup>
                <TargetFramework>net6.0</TargetFramework>
                <Nullable>enable</Nullable>
            
                <IsPackable>false</IsPackable>
              </PropertyGroup>
            
              <ItemGroup>
                <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
                <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
                <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
                <PackageReference Include="coverlet.collector" Version="3.1.0" />
              </ItemGroup>
            
            </Project>`
          },
          'base2/folder2/': {
              'A.txt': '# Hello world!',                
              'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
              namespace SimpleTestProject
              {
                  [TestClass]
                  public class UnitTest1
                  {
                      [TestMethod]
                      public void TestMethod1()
                      {
                      }
                  }
              }`,
              'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

              <PropertyGroup>
                <TargetFramework>net6.0</TargetFramework>
                <Nullable>enable</Nullable>
            
                <IsPackable>false</IsPackable>
              </PropertyGroup>
            
              <ItemGroup>
                <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
                <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
                <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
                <PackageReference Include="coverlet.collector" Version="3.1.0" />
              </ItemGroup>
            
            </Project>`
          }            
      })

      const searchPatterns: string[] = ['base1/folder1/*', 'base2/folder2/*']
      var searchFolder: string = searchPatterns.join('\n')
      const globOptions : glob.GlobOptions = 
      {
          followSymbolicLinks:false,
          implicitDescendants: true,
          omitBrokenSymbolicLinks: false
      }

      // Act
      let result = await Search.findFilesToUpload(searchFolder, globOptions)

      // Assert        
      expect(result.filesToUpload).toEqual(expectFiles)
      mock.restore()
  })

  test.each([[NoFileOptions.warn, core.warning], [NoFileOptions.error, core.setFailed], [NoFileOptions.ignore, core.info]])('test uploadArtifact with ifNoFilesFound set to %s',  async (a, expected) => {
    // Arrange
    jest.mock('fs')
    mock({
          // Recursively loads all node_modules
        'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
        'tempFolder': {
            'A.txt': '# Hello world!',                
            'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
            namespace SimpleTestProject
            {
                [TestClass]
                public class UnitTest1
                {
                    [TestMethod]
                    public void TestMethod1()
                    {
                    }
                }
            }`,
            'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

            <PropertyGroup>
              <TargetFramework>net6.0</TargetFramework>
              <Nullable>enable</Nullable>
          
              <IsPackable>false</IsPackable>
            </PropertyGroup>
          
            <ItemGroup>
              <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
              <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
              <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
              <PackageReference Include="coverlet.collector" Version="3.1.0" />
            </ItemGroup>
          
          </Project>`
        }
    })
    
    const coreGetInputMock = jest.spyOn(core, 'getInput');
    when(coreGetInputMock)
    .calledWith(Inputs.Name).mockReturnValue('vstest-functional-test.csproj')
    .calledWith(Inputs.IfNoFilesFound).mockReturnValue(a)
    .calledWith(Inputs.RetentionDays).mockReturnValue('30');

    jest.spyOn(core, 'warning')
    jest.spyOn(core, 'info')
    jest.spyOn(core, 'setFailed')

    var filesToUploadValue: string[] = [];
    var rootDirectoryValue = __dirname;

    const searchResults = {
        filesToUpload: filesToUploadValue,
        rootDirectory: rootDirectoryValue
    };

    jest.mock('../src/search');
    const findFilesToUploadMock = jest.spyOn(Search, 'findFilesToUpload');
    when(findFilesToUploadMock).mockResolvedValue(searchResults);

    // Act
    uploadArtifact();

    // Assert
    expect(expected).toBeCalled
  }) 

})