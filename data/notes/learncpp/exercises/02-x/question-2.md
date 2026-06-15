---
title: Question 2
---

# Question 2

Modify the program you wrote in [exercise #1](question-1) so that `readNumber()` and `writeAnswer()` live in a separate file called `io.cpp`. Use a forward declaration to access them from `main()`.

If you’re having problems, make sure `io.cpp` is properly added to your project so it gets compiled.

## Solution

```cpp:main.cpp
int readNumber();
void writeAnswer(int num);

int main()
{
    int x { readNumber() };
    int y { readNumber() };

    writeAnswer(x + y);

    return 0;
}
```

```cpp:io.cpp
#include <iostream>

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
