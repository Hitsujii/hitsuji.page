---
title: Functions
summary: Small reusable pieces of program behavior.
---

# Functions

Function is a reusable block of code that performs one specific task.

Declaration tells the compiler that a function exists:

```cpp
int add(int x, int y);
```

Definition contains the function body:

```cpp
int add(int x, int y)
{
    return x + y;
}
```

Function with a non-`void` return type returns a value to the caller:

```cpp
return x + y;
```

`void` function does not return a value.

## Parameters and arguments

`parameter` is a variable in the function header.

```cpp
int add(int x, int y)
//      ^      ^
//      parameters
```

`argument` is the value passed in a function call.

```cpp
add(2, 3);
//  ^  ^
//  arguments
```

With normal parameters, argument value is copied into the parameter.

This is **pass by value**.

```cpp
void change(int x)
{
    x = 5;
}

int main()
{
    int value { 1 };
    change(value);

    std::cout << value << '\n'; // still 1
}
```

Original `value` does not change, because `change()` receives a copy.

## Scope and lifetime

`scope` is the part of code where a name is visible.

`lifetime` is the time from object creation to object destruction.

A local variable in one function is not visible in another function.

This distinction matters because a name can stop being visible before I even start thinking about memory.

Very friendly language.

## My rule for now

Function should do one specific thing.

If I can separate calculating a result from printing the result, I probably should.

When functions start being used across files, their declarations usually go into [headers](headers.md).
