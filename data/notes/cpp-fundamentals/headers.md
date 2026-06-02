---
title: Headers
summary: "Where declarations live when code is split across files."
---

# Headers

Header is a `.h` file used mainly for declarations.

Example `add.h`:

```cpp
#ifndef ADD_H
#define ADD_H

int add(int x, int y);

#endif
```

Put definitions in `.cpp` files, and declarations in headers.

The paired `.cpp` file usually has the same base name as the header and includes it directly:

```cpp
#include "add.h"

int add(int x, int y)
{
    return x + y;
}
```

Include my own headers with quotes:

```cpp
#include "add.h"
```

Include standard headers with angle brackets:

```cpp
#include <iostream>
```

Do not include `.cpp` files. Add them to [compilation](compiler.md) instead.

## Header guard

Header guard protects a header from being included multiple times into the same translation unit.

```cpp
#ifndef SOME_UNIQUE_NAME_H
#define SOME_UNIQUE_NAME_H

// declarations here

#endif
```

How it works:

1. `#ifndef` checks whether the macro has not been defined yet.
2. `#define` defines the macro.
3. On the next include of the same header, the code between `#ifndef` and `#endif` is skipped.

Header guard uses [preprocessor](preprocessor.md) directives.

Header guard does not block including the same header in different `.cpp` files.

Header guard also does not replace the rule: declarations in `.h`, function definitions in `.cpp`.

`#pragma once` works similarly and is convenient, but it is not part of the C++ standard.
