# TypeScript Configuration Reference

This document provides a comprehensive reference for TypeScript configuration options used in this monorepo, based on the [official TypeScript documentation](https://www.typescriptlang.org/tsconfig/).

## Table of Contents

- [Root Fields](#root-fields)
- [Compiler Options](#compiler-options)
  - [Type Checking](#type-checking)
  - [Modules](#modules)
  - [Emit](#emit)
  - [JavaScript Support](#javascript-support)
  - [Interop Constraints](#interop-constraints)
  - [Language and Environment](#language-and-environment)
  - [Projects](#projects)
  - [Output Formatting](#output-formatting)
  - [Completeness](#completeness)

## Type Checking

### `strict`
Enable all strict type checking options. This enables:
- `noImplicitAny`
- `noImplicitThis`
- `alwaysStrict`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitReturns`
- `noFallthroughCasesInSwitch`
- `noUncheckedIndexedAccess`
- `noImplicitOverride`
- `noPropertyAccessFromIndexSignature`
- `exactOptionalPropertyTypes`
- `noUncheckedSideEffectImports`
- `noImplicitUseStrict`
- `useUnknownInCatchVariables`

**Default:** `false`  
**Released:** 2.3

### `strictNullChecks`
When `strictNullChecks` is `true`, `null` and `undefined` are not in the domain of every type and are not assignable to anything except themselves and `any` (the one exception being that `undefined` is also assignable to `void`).

**Default:** `false`  
**Released:** 2.0

### `noUnusedLocals`
Report errors on unused local variables.

**Default:** `false`  
**Released:** 2.0

### `noUnusedParameters`
Report errors on unused parameters.

**Default:** `false`  
**Released:** 2.0

### `noFallthroughCasesInSwitch`
Report errors for fallthrough cases in switch statements. Ensures that any non-empty case inside a switch statement either includes `break`, `return`, or `throw`.

**Default:** `false`  
**Released:** 1.8

## Modules

### `module`
Specify what module code is generated.

**Allowed values:**
- `"none"`
- `"commonjs"`
- `"amd"`
- `"umd"`
- `"system"`
- `"es2015"` / `"es6"`
- `"es2020"`
- `"es2022"`
- `"esnext"`
- `"node16"` / `"nodenext"`

**Default:** `"es2015"` for `target: "ES6"`, `"commonjs"` otherwise  
**Released:** 1.5

### `moduleResolution`
Specify how TypeScript looks up files from module specifiers.

**Allowed values:**
- `"node"` (default)
- `"node16"` / `"nodenext"`
- `"bundler"`
- `"classic"`

**Default:** `"node"`  
**Released:** 1.6

### `resolveJsonModule`
Include modules imported with `.json` extension.

**Default:** `false`  
**Released:** 2.9

### `allowImportingTsExtensions`
Allow imports to include TypeScript file extensions. Requires `noEmit: true` or `outDir` to be set to a different folder than the source files.

**Default:** `false`  
**Released:** 5.0

### `baseUrl`
Specify the base directory to resolve non-relative module names.

**Example:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Released:** 2.0

### `types`
Specify type package names to include without glob patterns.

**Example:**
```json
{
  "compilerOptions": {
    "types": ["node", "bun"]
  }
}
```

**Default:** `[]`  
**Released:** 2.0

## Emit

### `declaration`
Generate corresponding `.d.ts` file.

**Default:** `false`  
**Released:** 1.0

### `declarationMap`
Generates a sourcemap for `.d.ts` files which map back to the original `.ts` source file. This will allow editors like VS Code to go to the original `.ts` file when using features like Go to Definition.

**Default:** `false`  
**Released:** 2.9

### `noEmit`
Do not emit compiler output files like JavaScript source code, source-maps or declarations.

**Default:** `false`  
**Released:** 1.4

### `incremental`
Save `.tsbuildinfo` files to allow for incremental compilation of projects.

**Default:** `false`  
**Released:** 3.4

### `inlineSources`
Include sourcemap files inside the emitted JavaScript.

**Default:** `false`  
**Released:** 1.5

## JavaScript Support

### `allowJs`
Allow JavaScript files to be a part of your program. The TypeScript compiler will apply type checking to all files in the program, including JavaScript files.

**Default:** `false`  
**Released:** 1.8

### Interop Constraints

#### `esModuleInterop`
Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility.

**Default:** `false`  
**Released:** 2.7

#### `forceConsistentCasingInFileNames`
Ensure that casing is correct in imports.

**Default:** `false`  
**Released:** 2.0

#### `isolatedModules`
Ensure that each file can be safely transpiled independently of other files.

**Default:** `false`  
**Released:** 2.0

## Language and Environment

### `target`
Specify ECMAScript target version.

**Allowed values:**
- `"es3"` (default)
- `"es5"`
- `"es6"` / `"es2015"`
- `"es2016"`
- `"es2017"`
- `"es2018"`
- `"es2019"`
- `"es2020"`
- `"es2021"`
- `"es2022"`
- `"esnext"`

**Default:** `"es3"`  
**Released:** 1.0

#### `lib`
Specify library files to be included in the compilation.

**Common values:**
- `"dom"`
- `"dom.iterable"`
- `"es6"`
- `"es2015"`
- `"es2019"`
- `"es2020"`
- `"esnext"`

**Default:** `["lib"]`  
**Released:** 1.0

#### `jsx`
Specify JSX code generation.

**Allowed values:**
- `"preserve"`
- `"react"`
- `"react-jsx"`
- `"react-jsxdev"`
- `"react-native"`

**Default:** `"preserve"`  
**Released:** 1.6

#### `useDefineForClassFields`
Use `Object.defineProperty` to define class fields instead of assignment.

**Default:** `false`  
**Released:** 3.7

## Projects

### `composite`
Enable project references for this project.

**Default:** `false`  
**Released:** 3.0

## Output Formatting

### `preserveWatchOutput`
Disable wiping the console in watch mode.

**Default:** `false`  
**Released:** 3.8

## Completeness

#### `skipLibCheck`
Skip type checking of declaration files.

**Default:** `false`  
**Released:** 2.0

## Best Practices

1. **Use `extends`** to share common configurations across projects
2. **Enable `strict`** for better type safety
3. **Set appropriate `target`** based on your deployment environment
4. **Use `moduleResolution: "bundler"`** for modern bundlers like Vite
5. **Include `skipLibCheck: true`** for faster compilation
6. **Set `noEmit: true`** when using bundlers that handle compilation
7. **Use `isolatedModules: true`** for better compatibility with bundlers

## References

- [Official TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html) 