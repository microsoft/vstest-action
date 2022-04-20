import * as glob from '@actions/glob'
import {findFilesToUpload} from '../src/search';
import {getInputs} from '../src/input-helper';
import {NoFileOptions} from '../src/constants';
import { run } from '../src/index'

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
