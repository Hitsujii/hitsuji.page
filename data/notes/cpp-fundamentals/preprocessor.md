---
title: Preprocessor
summary: "Textual processing before compilation."
---

# Preprocessor

Before compilation, every `.cpp` file goes through preprocessing.

Preprocessor makes textual changes to the code, but it does not modify the original files.

The result of preprocessing is a **translation unit**, meaning a single `.cpp` file after directives such as `#include` have been expanded.

Preprocessor directive starts with `#` and ends at the newline, not with a semicolon.

```cpp
#include <iostream>
#define MY_NAME
#ifdef MY_NAME
#endif
```

`#include` inserts the contents of the specified file in place of the directive:

```cpp
#include "add.h"
```

`#define` creates a macro.

`#define` macros work from the place of definition to the end of the current file.

If a macro is in a header, it also reaches files that include that header.

That is powerful, and also exactly the kind of thing that can make debugging feel cursed.

## Conditional compilation

Conditional compilation means including or excluding parts of code before compilation.

`#ifdef` and `#ifndef` work like conditions for the preprocessor:

```cpp
#ifndef MY_NAME
    std::cout << "End!\n";
#endif
```

This code is included in compilation only if the `MY_NAME` macro does not exist.

`#if 0 ... #endif` can temporarily exclude a block of code from compilation.

The same mechanism is used in [header guards](headers.md#header-guard).

This is why preprocessor belongs near [headers](headers.md), even if at first it looks like suspicious magic.
