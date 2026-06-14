---
title: Debugging
summary: Finding bugs.
---

# Debugging

I will probably look for bugs very often, and this process is called debugging.
It helps me find the reason why the program does not do what I want.

Simple pathing:

```
cause -> reproducing the bug -> analysis -> fixes -> testing again
```

## Bugs

The compiler can inform us very early about a **syntax error**, which violates the grammar of C++.

Bugs that we discover at runtime are usually **semantic errors** or **logic errors**, which means the program has incorrect meaning or behavior, for example:

```cpp
int add(int x, int y)
{
    return x - y; // should be x + y
}
```

**Using an [uninitialized](initialization) variable is a semantic error and can lead to undefined behavior.**

## Finding bugs

- When we find a bug, we can try to reproduce it.
  (This is the simplest way to understand the flow that causes it.)

- Narrowing down the area of code where the bug may exist.

### Debug messages

Logging with `std::cerr`:

```cpp
std::cerr << "x = " << x << '\n';
```

We can use [preprocessor](preprocessor) conditions to switch debugging code on and off.

```cpp
#ifdef ENABLE_DEBUG
std::cerr << "getInput() called\n";
#endif
```

Unfortunately, this option can make our code too dirty, so in bigger programs it is better to use a proper logging system or write logs to external log files.

## Debugger

When using a debugger, we stop the program in its current state.

A `breakpoint` stops program execution on a selected line.
`watches` show variables or expressions.
The `call stack` shows all active function calls.

### Debugger navigation

- `step into` - enter a function
- `step over` - execute the current line without entering function calls
- `step out` - leave the current function
- `continue` - continue the program (until the next breakpoint)

## Good practices

It is worth making **smaller changes** and testing them right away.

Using warnings, assertions, and analysis statistically shortens debugging time.

`refactoring` is changing the structure of code without changing its behavior.

## GDB

Debugging in the terminal can be significantly faster and more convenient than using graphical options.

After [compiling](compiler) the program correctly with debugger flags, we can use `GDB` to debug the program:

```bash
gdb ./program
```

We navigate the debugger with these commands:

- `break main` - sets a breakpoint on the `main` function
- `break file.cpp:10` - sets a breakpoint on line 10
- `run` - starts the program inside the debugger
- `next` - moves to the next line without entering function calls
- `step` - moves to the next line and enters function calls
- `continue` - continues the program until the next breakpoint
- `print x` - prints the value of `x`
- `list` - shows the code around the current line
- `bt` - shows the call stack
- `quit` - exits the debugger
