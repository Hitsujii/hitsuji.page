---
title: Question 4
---

# Question 4

Extra credit: The following program is supposed to add two numbers, but doesn’t work correctly.

Use the integrated debugger to step through this program. For inputs, enter 8 and 4. Based on the information you learn, fix the following program:

```cpp
#include <iostream>

int readNumber()
{
    std::cout << "Please enter a number: ";
    char x{};
    std::cin >> x;

    return x;
}

void writeAnswer(int x)
{
    std::cout << "The sum is: " << x << '\n';
}

int main()
{
    int x { readNumber() };
    int y { readNumber() };
    writeAnswer(x + y);

    return 0;
}
```

## Fix

```cpp
int readNumber()
{
    int x {};
    std::cin >> x;
    return x;
}
```

## Solution

```cpp
#include <iostream>

int readNumber()
{
    std::cout << "Please enter a number: ";
    int x {};
    std::cin >> x;

    return x;
}

void writeAnswer(int x)
{
    std::cout << "The sum is: " << x << '\n';
}

int main()
{
    int x { readNumber() };
    int y { readNumber() };

    writeAnswer(x + y);

    return 0;
}
```
