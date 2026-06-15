---
title: Rules
---

# Rules

## Naming

Use `lowerCamelCase` for variables and functions.

```cpp
int userAge {};
int maxAttempts {};
int totalScore {};

int readNumber();
int calculateTotal();
void printResult(int value);
```

Variables should usually be nouns.

```cpp
int number {};
int result {};
int attempts {};
std::string name {};
```

Functions should usually start with verbs.

```cpp
readNumber()
calculateScore()
printResult()
isEven()
hasInput()
```

Names should explain intent.

```cpp
// Bad
int data {};
int thing {};
int temp {};

// Better
int userAge {};
int finalScore {};
int selectedOption {};
```

Use short generic names only in tiny scopes.

```cpp
for (int i { 0 }; i < 10; ++i)
{
}
```

Use descriptive names when the variable lives longer than a few lines.

```cpp
for (int studentIndex { 0 }; studentIndex < studentCount; ++studentIndex)
{
}
```

Boolean names should read like yes/no questions.

```cpp
bool isValid {};
bool hasInput {};
bool shouldPrint {};
bool canMove {};
```

Avoid negative boolean names when possible.

```cpp
// Harder to read
bool isNotValid {};
bool hasNoInput {};
```

File names should be lowercase with underscores.

```text
main.cpp
io.cpp
math.cpp
user_input.cpp
score_calculator.cpp
game_state.cpp
```

Use one word for a simple concept.

```text
main.cpp
io.cpp
math.cpp
```

Use underscores for descriptive names with multiple words.

```text
user_input.cpp
score_calculator.cpp
game_state.cpp
```

Name files after what they contain or the responsibility they handle.

```text
user_input.cpp         reading input from the user
score_calculator.cpp   score calculation logic
game_state.cpp         game state data and helpers
```

Avoid vague file names.

```text
utils.cpp
helpers.cpp
stuff.cpp
```

## Functions

One function should do one job.

```text
- read input
- calculate result
- print output
```

Keep `main()` simple.

```cpp
int main()
{
    int number { readNumber() };
    int result { doubleNumber(number) };

    printResult(result);

    return 0;
}
```

Use parameter names that explain the role.

```cpp
int doubleNumber(int number);
int calculateArea(int width, int height);
```

Avoid meaningless parameter names.

```cpp
// Bad
int calculateRectangleArea(int x, int y);

// Good
int calculateRectangleArea(int width, int height);

// Fine for coordinates
int calculateDistance(int x1, int y1, int x2, int y2);
```

If a function returns a value, use the returned value.

```cpp
int number { readNumber() };
```

Do not call a function and expect an argument to change unless it was designed to do that.

```cpp
// Bad
readNumber(number);
```

Function names should make side effects obvious.

```cpp
int calculateResult(int number);
void printResult(int result);
int readNumber();
```

Avoid hidden side effects inside calculation functions.

```cpp
// Bad
int calculateResult(int number)
{
    std::cout << "Calculating...\n";
    return number * 2;
}
```

## Variables

Use brace initialization by default.

```cpp
int number {};
int maxAttempts { 3 };
std::string name {};
```

Declare variables close to where they are used.

```cpp
int number { readNumber() };
int result { doubleNumber(number) };
printResult(result);
```

Do not create variables before they are needed.

```cpp
// Bad
int number {};
int result {};

// many lines later...
```

Use `const` when a value should not change.

```cpp
const int maxAttempts { 3 };
```

Use `constexpr` for true compile-time constants.

```cpp
constexpr int maxAttempts { 3 };
```

Use named constants instead of unexplained numbers.

```cpp
constexpr int maxAttempts { 3 };

if (attempts >= maxAttempts)
{
    return;
}
```

## Comments

Do not comment what the code already says.

```cpp
// Bad
// add 1 to count
++count;
```

Comment why something exists.

```cpp
// User gets three attempts before program exits.
constexpr int maxAttempts { 3 };
```

Do not use comments to excuse bad names.

```cpp
// Bad
int d {}; // user age

// Better
int userAge {};
```

## Files

Do not include `.cpp` files.

```cpp
// Bad
#include "io.cpp"

// Good
#include "io.h"
```

Include only what the file uses.

```cpp
#include "io.h"

#include <iostream>
```
