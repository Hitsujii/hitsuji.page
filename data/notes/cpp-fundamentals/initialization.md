---
title: Initialization
summary: "How variables receive their first value."
---
# Initialization

Initialization means giving an object its first value when it is created.

```cpp
int a;         // default-initialization, no initial value
int b = 5;     // copy-initialization
int c ( 6 );   // direct-initialization
int d { 7 };   // direct-list-initialization, preferred
int e {};      // value-initialization, usually 0 for int
int f = { 8 }; // copy-list-initialization, rarely used
```

For now I prefer brace initialization:

```cpp
int x { 5 };
```

Avoid uninitialized variables:

```cpp
int x; // local int has an indeterminate value
```

Safer:

```cpp
int x {};
```

Braces block narrowing conversions:

```cpp
int x { 4.5 }; // error
```

That is good. I want the compiler to complain before I accidentally turn `4.5` into `4` and pretend everything is fine.

When a variable will receive a value later, for example through [`std::cin`](iostream), I still initialize it first:

```cpp
int x {};
std::cin >> x;
```

Marking an intentionally unused variable:

```cpp
[[maybe_unused]] int x { 5 };
```
