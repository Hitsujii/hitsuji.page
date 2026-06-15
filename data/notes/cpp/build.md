---
title: Build
---

# Build

## Debug build

```bash
g++ -std=c++23 -Wall -Wextra -Wconversion -Wsign-conversion -pedantic-errors -Werror -ggdb main.cpp -o main && ./main
```

## Multiple `.cpp` files

Do not include `.cpp` files.

Compile all source files together:

```bash
g++ -std=c++23 -Wall -Wextra -Wconversion -Wsign-conversion -pedantic-errors -Werror -ggdb main.cpp input.cpp -o main && ./main
```

## Release build

```bash
g++ -std=c++23 -Wall -Wextra -Wconversion -Wsign-conversion -pedantic-errors -Werror -O2 -DNDEBUG main.cpp -o main && ./main
```

## Flags

```text
-std=c++23          language standard
-Wall               common warnings
-Wextra             extra warnings
-Wconversion        risky conversions
-Wsign-conversion   signed/unsigned conversions
-pedantic-errors    reject non-standard extensions
-Werror             warnings become errors
-ggdb               debugger information for GDB
-O2                 optimized release build
-DNDEBUG            disables assert
-o main             output file name
```

## Related

- [GDB](gdb)
