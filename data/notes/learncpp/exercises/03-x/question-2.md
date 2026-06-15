---
title: Question 2
---

# Question 2

The following program is supposed to divide two numbers, but doesn’t work correctly.

Use the integrated debugger to step through this program. For inputs, enter 8 and 4. Based on the information you learn, fix the following program:

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
	std::cout << "The quotient is: " << x << '\n';
}

int main()
{
	int x{ };
	int y{ };
	x = readNumber();
	x = readNumber();
	writeAnswer(x/y);

	return 0;
}
```

## Fix

```cpp
int x {};
int y {};

x = readNumber();
y = readNumber();

writeAnswer(x / y);
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
    std::cout << "The quotient is: " << x << '\n';
}

int main()
{
    int x {};
    int y {};

    x = readNumber();
    y = readNumber();

    writeAnswer(x / y);

    return 0;
}
```
