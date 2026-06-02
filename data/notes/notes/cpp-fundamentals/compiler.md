---
title: Compiler
summary: How `.cpp` files become an executable.
---

# Compiler

Compiler translates `.cpp` files into **object files**.

Then linker combines object files and libraries into an executable file.

```text
.cpp -> object files -> linker -> executable
```

## Debug and release

Debug:

```bash
g++ -std=c++23 -Wall -Wextra -Wconversion -Wsign-conversion -pedantic-errors -Werror -ggdb main.cpp -o main && ./main
```

Debug contains debugger information and has no optimization.

Release:

```bash
g++ -std=c++23 -Wall -Wextra -Wconversion -Wsign-conversion -pedantic-errors -Werror -O2 -DNDEBUG main.cpp -o main && ./main
```

Release is optimized for the finished version of the program.

`-DNDEBUG` disables debug assertions, for example `assert`.

## Multiple `.cpp` files

Do not include `.cpp` files. With multiple `.cpp` files, pass **all files to compilation**:

```bash
g++ main.cpp input.cpp -o main && ./main
```

If we define a function in another `.cpp` file, the current file still needs its declaration:

```cpp
int add(int x, int y);
```

When the program grows, declarations usually move into [headers](cpp-fundamentals/headers).

## Flags

```text
-std=c++23         use the C++23 standard
-Wall              enable many basic warnings
-Wextra            enable extra warnings
-Wconversion       warn about risky type conversions
-Wsign-conversion  warn about mixing signed and unsigned
-pedantic-errors   reject non-standard compiler extensions
-Werror            treat warnings as errors
-ggdb              add debugger information
-O2                optimize program for release
-DNDEBUG           disable debug assertions, e.g. assert
-o main            name the output file main
&& ./main          run program after successful compilation
```
