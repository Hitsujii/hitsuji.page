---
title: Progress
summary: "Short LearnCpp checkpoints written while going through the course."
---

# Progress

I keep short checkpoints here, mostly to remember what each lesson gave me and where I should return later.

## 0.1

1. LearnCpp teaches from the basics to modern C++.
2. Don't memorize everything. Return to lessons and documentation.
3. You need to write code, not only read it.

## 0.2

1. A program is a sequence of instructions executed by a computer.
2. Programs run on a platform, meaning a combination of hardware and software.
3. Portable code is code that is easy to run on different platforms.

## 0.3

1. C++ started as an extension of C, but it isn't just C with add-ons.
2. C++ gives a lot of control, but you need to watch out for pitfalls.
3. C++ works well where performance and resource control matter.

## 0.4

1. Programming starts with defining the problem.
2. Then you plan the solution, and only after that you write code.
3. The main source file is usually named `main.cpp`.

## 0.5

1. The compiler translates `.cpp` files into object files.
2. The linker combines object files and libraries into an executable.
3. Build is the whole process of creating an executable program from source code.

## 0.6

1. An IDE combines an editor, compiler, linker, build system, and debugger.
2. For C++, use a compiler that supports at least C++17, preferably newer.
3. VS Code works, but it requires better setup than a full IDE.

## 0.7

1. A project is a container for program files and build settings.
2. A console project is enough for learning C++.
3. Build compiles and links the program, and run launches the finished executable.

## 0.8

1. If `cin`, `cout`, or `endl` are undefined, check `#include <iostream>` and `std::`.
2. A C++ program must have exactly one `main()` function.
3. If the program compiles but behaves incorrectly, you need to debug it.

## 0.9

1. A debug build has debugger information and usually no optimization.
2. A release build is optimized and has no extra debug data.
3. Use `-ggdb` for debug, and `-O2 -DNDEBUG` for release.

## 0.10

1. Compiler extensions are non-standard compiler additions.
2. They can make code work on your machine even though it isn't standard C++.
3. Disable extensions with `-pedantic-errors`.

## 0.11

1. Compiler warnings help find potential bugs.
2. It is worth enabling more warnings: `-Wall -Wextra -Wconversion -Wsign-conversion`.
3. `-Werror` treats warnings as errors.

## 0.12

1. Set the language standard with a flag, e.g. `-std=c++23`.
2. Without this flag, the compiler may use its default standard.
3. Set the standard explicitly so you know which C++ version you are using.

## 0.13

1. The `__cplusplus` macro lets you check which standard the compiler is using.
2. `202002L` means C++20, and `202302L` means C++23.
3. If you get C++20 without `-std=c++23`, that means C++20 is your compiler's default standard.

## 1.1

1. A statement is an instruction that performs some action.
2. A function is a group of statements executed sequentially.
3. A C++ program starts from the `main()` function.

## 1.2

1. Comments describe code for humans.
2. `//` creates a single-line comment.
3. `/* */` creates a block comment, but don't nest block comments.

## 1.3

1. Data is information processed, stored, or transmitted by a computer.
2. A value is a single piece of data, e.g. `5`, `'H'`, or `"Hello"`.
3. An object is a region of memory that stores a value.
4. A variable is a named object.
5. A type determines how to interpret the value stored in an object.

## 1.4

1. `assignment` means giving a value to a variable that already exists.
2. `initialization` means giving an initial value when creating a variable.
3. `=` means assignment, and `==` means comparison.
4. Prefer brace initialization, e.g. `int x { 5 };`.
5. `int x {};` is value-initialization. For a local `int`, it gives the value `0`.
6. Avoid uninitialized variables, e.g. `int x;`.
7. Braces `{}` block narrowing conversions, e.g. `int x { 4.5 };` gives an error.
8. `int x = 4.5;` or `int x(4.5);` may truncate the value to `4`.
9. If the value will be overwritten soon, use e.g. `int x {}; std::cin >> x;`.
10. Don't define multiple variables on one line.
11. `int a, b = 5;` means only `b` has the value `5`.
12. `[[maybe_unused]] int x { 5 };` means the variable may be intentionally unused.

## 1.5

1. `#include <iostream>` includes the `iostream` header, which gives us `std::cout` and `std::cin`.
2. `std::cout` prints data to the console.
3. `std::cin` reads data from the keyboard.
4. For a normal newline, prefer `'\n'` or `"\n"`, not `std::endl`.
5. `std::endl` does newline + flush, so it can be slower.
6. `std::cin` and `std::cout` use buffers.
7. `std::cin >> x` extracts as much data as fits the type of `x`.
8. Data that `std::cin` doesn't extract remains in the buffer.
9. When reading into a variable, still initialize it, e.g. `int x {};`.

## 1.6

1. C++ usually doesn't automatically initialize local variables of simple types, e.g. `int x;`.
2. An `uninitialized variable` is a variable that hasn't yet received a known value.
3. `initialized` means a value given at definition, while `assignment` means a value given later.
4. `int x;` is default-initialization, but for a local `int`, it usually leaves an indeterminate value.
5. Using an uninitialized variable may print a garbage value.
6. Using the value of an uninitialized variable causes undefined behavior.
7. `undefined behavior` means the C++ standard doesn't define what should happen.
8. Code with UB may appear to work, crash, produce random results, or change behavior after a small code change.
9. Always initialize variables, e.g. `int x {};` or `int x { 5 };`.
10. `implementation-defined behavior` is behavior chosen and documented by a given implementation.
11. `unspecified behavior` is implementation-dependent behavior without the requirement to document the choice.

## 1.7

1. `keywords` are reserved C++ words, e.g. `int`, `return`, `if`; you can't use them as your own names.
2. An `identifier` is a name given to something in code, e.g. a variable, function, or type.
3. An identifier can contain letters, digits, and `_`, but it can't start with a digit.
4. C++ is case-sensitive, so `value`, `Value`, and `VALUE` are different names.
5. Variables and functions usually start with a lowercase letter.
6. For multi-word names, consistently use either `camelCase` or `snake_case`.
7. In an existing project, match the style of that project.
8. Don't start your own names with `_`, because such names may be reserved.
9. A name should say what the value means, e.g. `customerCount` instead of `ccount`.
10. Avoid unclear abbreviations, because code is read more often than it is written.

## 1.8

1. `whitespace` means spaces, tabs, and newlines used to separate language elements and format code.
2. Some elements must be separated by whitespace, e.g. `int x;`, because `intx` would be a different identifier.
3. Whitespace inside text is literal, e.g. `"Hello world!"` and `"Hello     world!"` are different strings.
4. Adjacent strings separated only by whitespace are concatenated, e.g. `"Hello " "world!"`.
5. C++ is whitespace-independent, so formatting usually doesn't change meaning, but it affects readability.
6. Code inside braces should be indented one level.
7. LearnCpp uses a style where the opening function brace is on a separate line.
8. Long lines should be split, usually around 80 characters.
9. When breaking a long expression, put the operator at the beginning of the next line.
10. In an existing project, match the style of that project.
11. Use automatic formatting, e.g. an editor formatter or `clang-format`.

## 1.9

1. A `literal` is a fixed value written directly in code, e.g. `5`, `"Hello"`, or `'\n'`.
2. A literal has a value and a type, but its value is fixed and can't be changed.
3. A variable represents a place in memory whose value can be read and changed.
4. An `operator` performs an operation on operands, e.g. `3 + 4`.
5. An `operand` is a value an operator works on, e.g. in `3 + 4`, the operands are `3` and `4`.
6. The result of an operation in C++ is often called the `return value`.
7. The same operator can have different meanings depending on context, e.g. `-5` and `4 - 3`.
8. Operators can be combined, and the result of one operation can become the operand of another.
9. A `side effect` is an observable effect besides returning a value, e.g. `x = 5` changes `x`, and `std::cout << 5` prints to the console.
10. `operator=` and `operator<<` return the left operand, which allows chaining, e.g. `x = y = 5` or `std::cout << "Hello " << "world!"`.

## 1.10

1. An `expression` is a piece of code that evaluates to a result, e.g. `2 + 3`, `x`, `five()`.
2. `evaluation` is the process of computing an expression, and the `result` is the output of that expression.
3. Where C++ expects a single value, you can use an expression, e.g. `int x { 2 + 3 };`.
4. An expression doesn't end with a semicolon. The semicolon ends the statement containing the expression.
5. An `expression statement` is an expression followed by a semicolon, e.g. `x = 5;`.
6. In an `expression statement`, the expression result is discarded, so expressions with side effects are usually the meaningful ones.
7. `2 * 3;` is syntactically valid but useless, because the result `6` is discarded.
8. A `subexpression` is an expression that is part of a larger expression, e.g. `4 + 5` in `x = 4 + 5`.
9. A `compound expression` is an expression with at least two operators, e.g. `x = 4 + 5`.

## 1.11

1. This lesson practices building a simple program with `std::cin`, `std::cout`, variables, and expressions.
2. A program can be split into input, calculation, and output.
3. If input will be used later, don't overwrite it unnecessarily.
4. If a result is used only once, you can calculate it directly where it is used, e.g. `std::cout << num * 2;`.

## 1.x

1. Chapter 1 collects the basics: statement, function, variable, type, initialization, input/output, UB, operators, expressions.
2. The most important pitfalls in the chapter: uninitialized variables, `std::endl`, narrowing conversion, and the `std::cin` buffer.
3. Coding task from the quiz: a program that reads two numbers and prints addition and subtraction.

## 2.1

1. A function is a reusable sequence of statements that performs a specific task.
2. A `function call` pauses the current execution point, runs the called function, and returns after it finishes.
3. The `caller` is the function that calls, and the `callee` is the function being called.
4. A `function header` contains the return type, name, and parameters of the function.
5. A `function body` is the code between `{}`.
6. Functions can be called many times.
7. Functions can call other functions.
8. C++ doesn't allow defining functions inside other functions.

## 2.2

1. A function with a non-`void` type returns a value to the caller.
2. The type before the function name is the `return type`.
3. `return expression;` evaluates the expression, returns its result to the caller, and ends the function.
4. Returning a value works as return by value.
5. The caller can use the returned value or ignore it.
6. A function with a non-`void` return type must return a value on all execution paths.
7. Missing `return` in a value-returning function causes undefined behavior.
8. `main()` must return `int` and shouldn't be called manually.
9. `return 0;` from `main()` means normal program termination.
10. A function can return only one value per call.
11. DRY means `Don't Repeat Yourself`.

## 2.3

1. `void` as a return type means the function doesn't return a value.
2. A `void` function can perform actions, e.g. print text or modify data.
3. A `void` function automatically returns to the caller after reaching the end of its body.
4. Don't put `return;` at the end of a `void` function, because it is unnecessary.
5. `return;` without a value can make sense in a `void` function if you want to exit early.
6. A `void` function can't be used where an expression producing a value is required.
7. Returning a value from a `void` function is a compile error.

## 2.4

1. A `parameter` is a variable in the function header.
2. An `argument` is the value passed in a function call.
3. The number of arguments usually must match the number of parameters.
4. With ordinary parameters, the argument value is copied into the parameter. This is `pass by value`.
5. Parameters that use `pass by value` are `value parameters`.
6. An argument can be any valid expression.
7. A function return value can be passed directly as an argument to another function.
8. Parameters and return values together let you write functions like: take data, calculate something, return the result.
9. An `unreferenced parameter` is a parameter that exists but isn't used in the function body.
10. If a parameter must exist but is unused, you can omit its name.

## 2.5

1. A `local variable` is a variable defined inside a function.
2. Function parameters are also treated as local variables.
3. `lifetime` is the time an object exists: from creation to destruction. This is runtime.
4. Local variables are destroyed at the end of the block `{}` in reverse order of creation.
5. `scope` is the region of code where an identifier is visible. This is compile-time.
6. A local variable from one function isn't visible in another function.
7. Functions can have local variables with the same names, and these are separate objects.
8. With `pass by value`, a function parameter is a separate copy of the argument.
9. Changing a parameter passed by value doesn't change the variable in the caller.
10. Define local variables as close as possible to their first use.
11. Use a parameter when the caller should provide the initial value.
12. Use a local variable when the value should be created inside the function.
13. A `temporary object` is an unnamed object created by the compiler for a short time.
14. Temporary objects are destroyed at the end of the full expression.

## 2.6

1. Functions help organize code, remove repetition, test, extend a program, and hide implementation details.
2. Code repeated more than once is a good candidate for a function.
3. Code with clear input and output is also a good candidate for a function.
4. A function should do one specific thing.
5. Don't combine calculating a result and printing a result in one function if they can be separated cleanly.
6. When a function becomes long or hard to understand, you can split it into smaller functions. This is refactoring.
7. A simple program can often be split into input, calculation, and output.

## 2.7

1. The compiler reads a file from top to bottom.
2. If you call a function before the compiler has seen it, you get an error.
3. A `forward declaration` announces a function before its definition.
4. For functions, a forward declaration is written as a function prototype.
5. A function prototype contains the return type, name, parameters, and semicolon, but no function body.
6. Parameter names in a declaration are optional, but writing them helps readability.
7. If a function is declared and called, but has no definition anywhere, compilation can pass, but the linker fails.
8. A `declaration` tells the compiler that an identifier exists and what type it has.
9. A `definition` implements a function or creates a variable.
10. Every definition is a declaration, but not every declaration is a definition.
11. A `pure declaration` is a declaration without a definition.
12. ODR means you can't define the same thing twice in the same scope.
13. Forward declarations are especially important with multiple `.cpp` files.

## 2.8

1. Larger programs are split into multiple `.cpp` files.
2. When compiling from the terminal, you must pass all `.cpp` files.
3. The compiler compiles each file separately and doesn't remember the contents of other files.
4. If `main.cpp` uses a function from `input.cpp`, `main.cpp` must know its declaration.
5. A forward declaration satisfies the compiler, and the linker later connects the call to the definition in another file.
6. Missing a forward declaration gives a compile error.
7. Missing a definition or missing a `.cpp` file in compilation gives a linker error.
8. Each `.cpp` file that uses `std::cout` or `std::cin` must have its own `#include <iostream>`.
9. Don't include `.cpp` files. Compile them together.

## 2.9

1. A `naming collision` is a name conflict where two identifiers have the same name and the compiler or linker can't distinguish them.
2. A name conflict in the same file usually gives a compile error, while a conflict between `.cpp` files usually gives a linker error.
3. A `scope region` is a region of code where names must be unique.
4. A `namespace` creates a separate scope for names and helps avoid conflicts.
5. Things not defined in a function, class, or namespace go into the `global namespace`.
6. The C++ standard library is in the `std` namespace, so we write e.g. `std::cout`.
7. `::` is the scope resolution operator, e.g. `std::cout` means `cout` from the `std` namespace.
8. A name with a namespace prefix, e.g. `std::cout`, is a `qualified name`.
9. Prefer explicit namespace prefixes, e.g. `std::cout`, instead of `using namespace std;`.
10. Avoid `using namespace std;`, especially at the top of a file and in headers, because it increases the risk of naming conflicts.

## 2.10

1. Before compilation, each `.cpp` file goes through preprocessing.
2. The `preprocessor` makes textual changes to code, but it doesn't modify the original files.
3. The result of preprocessing is a `translation unit`, meaning a `.cpp` file after directives such as `#include` have been expanded.
4. A `preprocessor directive` starts with `#` and ends at the newline, not with a semicolon.
5. `#include` inserts the contents of the specified file in place of the directive.
6. `#define` creates a macro, meaning a rule for textual replacement.
7. Avoid macros with replacement text, e.g. `#define PI 3.14`, if there is a normal C++ alternative.
8. Macros without replacement text can be used as switches for conditional compilation.
9. `#ifdef`, `#ifndef`, and `#endif` let you conditionally include or exclude code from compilation.
10. `#if 0 ... #endif` lets you temporarily exclude a block of code from compilation.
11. `#define` works from the place of definition to the end of the current file, unless it reaches another file through `#include`.

## 2.11

1. A `header file` is a header, usually `.h`, used mainly for declarations.
2. A header lets you keep declarations in one place and include them where they are needed.
3. Include your own headers with `" "`, e.g. `#include "add.h"`.
4. Include standard headers with `< >`, e.g. `#include <iostream>`.
5. A header paired with a `.cpp` file should have the same base name, e.g. `add.h` and `add.cpp`.
6. The `.cpp` file should include its paired header, e.g. `add.cpp` should have `#include "add.h"`.
7. For now, put declarations in headers and keep function definitions in `.cpp` files.
8. Function definitions in a header can violate ODR if the header is included into multiple `.cpp` files.
9. Don't include `.cpp` files. Add them to compilation.
10. Each file should include the headers it needs directly, without relying on transitive includes.
11. A header that uses things from another header should include that header itself.
12. Every header should have a header guard.

## 2.12

1. A `header guard` protects a header from being included multiple times into the same `translation unit`.
2. Every custom header should have a header guard.
3. A classic header guard uses `#ifndef`, `#define`, and `#endif`.
4. The guard name should be unique, usually based on the file name, e.g. `ADD_H` for `add.h`.
5. The header guard allows the header contents through on the first `#include`, and skips later includes in the same file.
6. A header guard doesn't block including the same header in different `.cpp` files.
7. A header guard doesn't replace the rule: declarations in `.h`, function definitions in `.cpp`.
8. `#pragma once` does something similar and is convenient, but it isn't part of the C++ standard.

## 2.13

1. Before writing code, first define the goal of the program.
2. Then define the requirements, meaning what the program should do and what limits it has.
3. Break a hard problem into smaller steps.
4. Splitting a problem into steps naturally leads to splitting a program into functions.
5. First set the order of program actions, e.g. `input -> calculation -> output`.
6. Implement the program in small stages: write a piece, compile, test.
7. Don't write the whole program at once.
8. First make a simple working version, then expand it.
9. Don't polish the first code version too early.
10. At the beginning, readability and maintainability matter more than micro-optimization.

## 3.1

1. Syntax errors break C++ grammar and are reported by the compiler.
2. Semantic errors have wrong meaning or break non-syntax language rules.
3. Some semantic errors are compile-time errors, e.g. undeclared names or wrong return types.
4. Runtime semantic errors can crash, produce wrong output, or cause undefined behavior.
5. A logic error is a semantic error where behavior doesn't match the intended behavior.

## 3.2

1. Debugging starts after incorrect behavior is observed.
2. Find the root cause, not only the visible symptom.
3. Understand the cause before changing code.
4. Apply the fix, rebuild, and retest the original case.
5. Retest related behavior to check that the fix didn't introduce new problems.

## 3.3

1. Most debugging time is usually spent finding where the error is.
2. Code inspection can work when the problem can be narrowed to a small area.
3. In larger programs, inspection becomes less reliable because there is more code, more state, and more assumptions.
4. If inspection isn't enough, reproduce the problem and observe the program while it runs.
5. Reproduction steps should make the issue appear predictably.
6. Narrow the search by proving whether the problem has or hasn't occurred at selected points.

## 3.4

1. Basic debugging tactics help make targeted guesses and collect runtime information.
2. Commenting out code can exclude sections that don't affect the symptom.
3. Temporary debug output can validate which functions are called.
4. Print values to check where program state first becomes wrong.
5. Use `std::cerr` for temporary debug output, not `std::cout`.
6. Debug print statements are useful but should be removed after diagnosis.

## 3.5

1. Debug print statements don't scale well when they must be added and removed manually.
2. A preprocessor switch can enable or disable debug output without deleting the statements.
3. `#ifdef ENABLE_DEBUG` keeps debug output conditional, but it adds code clutter.
4. In multi-file programs, put the debug switch in a shared header if all files need the same setting.
5. Logging separates diagnostic output from normal program output.
6. For larger programs, prefer a logger over many temporary `std::cerr` statements.


## 3.6

1. Program state includes variable values, active function calls, and the current execution point.
2. A debugger lets you control program execution and inspect program state while the program runs.
3. Use a debug build when debugging. Release builds may optimize code in ways that make stepping unreliable.
4. Stepping runs code statement by statement.
5. Step into enters function calls. Step over executes a function call without entering it. Step out finishes the current function and returns to the caller.
6. If you step too far, restart the debug session unless your debugger supports reverse debugging.

## 3.7

1. Use debugger run commands to jump to relevant code instead of stepping through everything.
2. `Run to cursor`: run until the selected statement is reached.
3. `Continue`: keep running from the current point until program end or the next breakpoint.
4. `Start`: begin a new debug session.
5. `Breakpoint`: persistent stop point used while debugging.
6. `Set next statement` changes the execution point, but doesn't restore program state.

## 3.8

1. Use variable inspection to check program state while debugging.
2. Hover and QuickWatch are useful for one-time checks.
3. The watch window tracks selected variables or expressions while stepping.
4. Out-of-scope variables may be unavailable or show the last known value.
5. Some debuggers can break when a watched variable changes.


## 3.9

1. The call stack shows active function calls at the current execution point.
2. The top entry is the function currently executing.
3. Lower entries are callers waiting for control to return.
4. Line numbers show the next statement to execute in each stack frame.
5. Use the call stack with breakpoints to see how execution reached a given line.

## 3.10

1. Catch issues early: write a little code, then test it.
2. Prefer readable, maintainable code over clever code.
3. Refactoring changes structure without changing behavior.
4. Don't mix refactoring with behavior changes; retest after each kind of change.
5. Defensive programming checks expected input and assumptions.
6. Unit tests, assertions, compiler warnings, and static analysis can find problems earlier.
