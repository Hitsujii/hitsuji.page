---
title: iostream
summary: "Console input and output with std::cout and std::cin."
---
# iostream

`#include <iostream>` includes the `iostream` header.

It gives access to things like `std::cout` and `std::cin`.

`std::cout` prints data to the console:

```cpp
std::cout << "Hello\n";
```

The `<<` operator sends data to the output stream.

The direction of the symbols helps me remember the direction of data flow.

`std::cin` reads data from the keyboard:

```cpp
int x {};
std::cin >> x;
```

`std::cin` does not wait for the user if there is already matching data in the buffer.

Characters not extracted by `operator>>` remain in the buffer for later.

> [!warning] `std::endl` prints a newline and flushes the buffer.

For a normal newline, I should use:

```cpp
'\n'
```

So the basic rule is:

```cpp
std::cout << "Text" << '\n';
```

Not:

```cpp
std::cout << "Text" << std::endl;
```

Unless I actually need a flush.
