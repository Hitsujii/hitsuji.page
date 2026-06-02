---
title: Program design
summary: "How I want to approach small C++ programs."
---

# Program design

Before coding, design the program first.

This sounds obvious, which means I will probably ignore it and then suffer.

## Simple process

1. Define the goal of the program.

```text
The program should read two numbers.
```

2. Define requirements, meaning what the program should do.

```text
The user enters numbers.
The program calculates the result.
The program prints the result.
```

3. Break a hard problem into smaller problems.

```text
calculator
- get first number
- get operation
- get second number
- calculate result
- print result
```

4. Turn those smaller parts into functions.

```cpp
getUserInput();
getMathematicalOperation();
calculateResult();
printResult();
```

This fits the rule that a [function](functions.md) should do one specific thing.

5. Decide the order of actions.

```text
input -> calculation -> output
```

6. Start with `main()` and commented function calls.

```cpp
int main()
{
    // getUserInput();
    // getMathematicalOperation();
    // calculateResult();
    // printResult();

    return 0;
}
```

7. Implement functions one by one.

```text
prototype -> body -> test
```

Do not write the whole program at once.

Start with a simple working version.

Do not improve the first version too early.

At the beginning, write for readability, not performance.
