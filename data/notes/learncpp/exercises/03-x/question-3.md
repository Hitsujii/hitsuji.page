---
title: Question 3
---

# Question 3

What does the call stack look like in the following program when the point of execution is on line 4? Only the function names are needed for this exercise, not the line numbers indicating the point of return.

```cpp
#include <iostream>

void d()
{ // here
}

void c()
{
}

void b()
{
	c();
	d();
}

void a()
{
	b();
}

int main()
{
	a();

	return 0;
}
```

## Result

When stopped inside `d()`, the active calls were:

```text
d()
b()
a()
main()
```

GDB view:

```gdb
(gdb) bt
#0  d () at main.cpp:4
#1  0x0000000000400462 in b () at main.cpp:11
#2  0x000000000040046e in a () at main.cpp:15
#3  0x000000000040047a in main () at main.cpp:19
```
