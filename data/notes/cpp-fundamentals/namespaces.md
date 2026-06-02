---
title: Namespaces
summary: "Separate scopes for names."
---

# Namespaces

A namespace is a separate scope for names.

It helps avoid naming conflicts.

```cpp
namespace a
{
    void print() {}
}

namespace b
{
    void print() {} // OK
}
```

`::` is the scope resolution operator.

In `std::cout`, the name `cout` is inside the `std` namespace.

A name with a namespace prefix, for example `std::cout`, is a qualified name.

For now I prefer explicit namespace prefixes:

```cpp
std::cout
```

Avoid:

```cpp
using namespace std;
```

Especially do not put `using namespace std;` in [headers](headers.md).

That would leak names into every file that includes the header, which sounds like a future headache generator.
