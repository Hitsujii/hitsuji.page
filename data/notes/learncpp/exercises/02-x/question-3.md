---
title: Question 3
---

# Question 3

Modify the program you wrote in #2 so that it uses a header file (named io.h) to access the functions instead of using forward declarations directly in your code (.cpp) files. Make sure your header file uses header guards.

## Solution

```cpp:main.cpp
#include "io.h"

int main()
{
    int x { readNumber() };
    int y { readNumber() };

    writeAnswer(x + y);

    return 0;
}
```

```cpp:io.h
#ifndef IO_H
#define IO_H

int readNumber();
void writeAnswer(int num);

#endif
```

```cpp:io.cpp
#include <iostream>
#include "io.h"

int readNumber()
{
    int num {};

    std::cout << "Enter a number: ";
    std::cin >> num;

    return num;
}

void writeAnswer(int num)
{
    std::cout << "The answer is: " << num << '\n';
}
```
