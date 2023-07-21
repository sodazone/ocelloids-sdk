## Debugging Guide: How to Debug TypeScript Code using VS Code

This tutorial will guide you on how to debug your TypeScript code using Visual Studio Code (VS Code). Debugging allows you to inspect and troubleshoot your code, making it easier to identify and fix issues.

### Prerequisites

Before you begin, make sure you are familiar with debugging TypeScript code in VS Code. If you're new to TypeScript debugging in VS Code, you can refer to the official documentation: [TypeScript Debugging in VS Code](https://code.visualstudio.com/docs/typescript/typescript-debugging).

You'll need a `tsconfig.json` file to instruct the TypeScript compiler to emit source maps in the "out" folder. This enables the debugger to map the compiled JavaScript code back to your original TypeScript code for easier debugging.

Here's an example `tsconfig.json` file:
```javascript
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ESNext",
  
    /* Modules */
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    
    /* Type Checking */
    "strict": true,
    "skipLibCheck": true,
    
    /* Emit */
    "outDir": "out",
    "sourceMap": true
  }
}
```

### Setting Up Launch Configuration

Now, let's create a launch configuration in VS Code that includes the source maps of `@sodazone/ocelloids`. This configuration will allow us to debug our code and step into the source code of the `@sodazone/ocelloids` package.

1. Open your project in VS Code.
2. Create a new file named `.vscode/launch.json` in the root folder of your project.
3. Add the following configuration to the `launch.json` file:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/${relativeFile}",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": [
        "${workspaceFolder}/out/**/*.js",
        "${workspaceFolder}/node_modules/@sodazone/**/*.js"
      ]
    }
  ]
}
```

### Starting the Debugging Session

With the launch configuration set up, you are now ready to start debugging your TypeScript code. Here's how you can do it:

1. Open the TypeScript file you want to debug.
2. Place breakpoints in your code at specific lines where you want the execution to pause for inspection.
3. Press `F5` or go to the Run and Debug sidebar, and click on the green "Play" button to start the debugging session.
4. Your code will start running, and when it hits a breakpoint, it will pause the execution, allowing you to inspect variables, check call stacks, and step through the code.
5. Use the debugging toolbar and controls to navigate through your code while observing the variable values and output.
6. To continue the execution after a breakpoint, you can press `F5` or click on the "Continue" button in the debugging toolbar.

Below is a screenshot capturing a breakpoint in action within Ocelloids mongo filters.

<div align="center">

<picture>
<img src="https://github.com/sodazone/ocelloids/blob/main/guides/assets/debugging_screenshot.png?raw=true"
    width="90%"
    height="auto"
    alt="Ocelloids Debugging Screenshot" />
</picture>

</div>

---

Congratulations! 👏🙌 You have successfully set up and used debugging in VS Code for your TypeScript code.

Remember to remove or disable any unnecessary breakpoints after you finish debugging. 🌈 Happy coding!
