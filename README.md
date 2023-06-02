# microsoft/vstest-action

This action will help run tests using VSTest framework and easily migrate a pipeline using [Azure DevOps VSTest task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/test/vstest?view=azure-devops). Most of the commonly used properties in the [Azure DevOps VSTest task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/test/vstest?view=azure-devops) map to properties of this GitHub action. Like the [Azure DevOps VSTest task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/test/vstest?view=azure-devops), this action only supports `Windows` but NOT `Linux`.

Due to the unavailability of a Test results UI, test results are displayed in the console logs of the action.

For more information about the action arguments, see [action.yml](action.yml).

## Example

## Example Usage

```yaml
- name: Build test project
  run: dotnet build test/InteractionTests/InteractionTests.csproj

- name: Run tests
  uses: microsoft/vstest-action@v1.0.0
  with:
    testAssembly: **/*InteractionTests.dll
    searchFolder: tests/
```

## Optional Parameters

There are a few additional parameters that can be set if you need them.
These are optional and should only be set if you know that you need them or what you are doing.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us the rights to use your contribution. For details, visit <https://cla.opensource.microsoft.com>.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services.
Authorized use of Microsoft trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).

Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
