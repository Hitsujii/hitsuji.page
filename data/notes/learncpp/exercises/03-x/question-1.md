---
title: Question 1
---

# Question 1

The program is supposed to add two numbers, but doesn't work correctly.
Use the integrated debugger to step through the program and watch the value of `x`.

```cpp
#include <iostream>

int readNumber(int x)
{
	std::cout << "Please enter a number: ";
	std::cin >> x;
	return x;
}

void writeAnswer(int x)
{
	std::cout << "The sum is: " << x << '\n';
}

int main()
{
	int x {};
	readNumber(x);
	x = x + readNumber(x);
	writeAnswer(x);

	return 0;
}
```

## Fix

```cpp
int x {};
x = readNumber(x);
x = x + readNumber(x);
```

## Solution

```cpp
#include <iostream>

int readNumber(int x)
{
    std::cout << "Please enter a number: ";
    std::cin >> x;
    return x;
}

void writeAnswer(int x)
{
    std::cout << "The sum is: " << x << '\n';
}

int main()
{
    int x {};
    x = readNumber(x);
    x = x + readNumber(x);

    writeAnswer(x);

    return 0;
}
```
