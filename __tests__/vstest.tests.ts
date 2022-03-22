
import {findFilesToUpload} from '../src/search';
import {getInputs} from '../src/input-helper';
import {NoFileOptions} from '../src/constants';
import { run } from '../src/index'

test('test getInputs', async () => {
    let inputs = getInputs()
    expect(inputs.artifactName).toBeGreaterThan(0)
})

test('test findFilesToUpload', async () => {
    var searchFolder = process.env['RUNNER_SEARCH'];

    let result = findFilesToUpload(searchFolder)
    expect((await result).filesToUpload).toBeGreaterThan(0)
})

test('vstest', async () => {
    await run()
})
