const path = require('path')
const fs = require('fs')
const io = require('@actions/io')
const data = require('./jest.setup.json')

jest.setTimeout(60000) // in milliseconds

// Set temp and tool directories before importing (used to set global state)
const cachePath = path.join(__dirname, '__tests__', 'CACHE')
const tempPath = path.join(__dirname, '__tests__', 'TEMP')
const searchPath = path.join(__dirname,'__tests__', 'SEARCH' )

// Define all the environment variables
process.env['RUNNER_SEARCH'] = searchPath
process.env['RUNNER_TEMP'] = tempPath
process.env['RUNNER_TOOL_CACHE'] = cachePath

// Set up all the user defined variables and inputs from jest.setup.json
setUserVars()

function setUserVars() {
  data.envVars.forEach(function(envVar) {
    process.env[envVar.name] = envVar.value
  });
  data.inputs.forEach(function(input) {
    setVar(input.name, input.value)
  });
}

if (!fs.existsSync(tempPath)) {
  io.mkdirP(tempPath)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function setVar(name, value) {
  process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value
}