---
title: GDB
---

# GDB

Compile with debug information first:

```bash
g++ -std=c++23 -Wall -Wextra -Wconversion -Wsign-conversion -pedantic-errors -Werror -ggdb main.cpp -o main
```

Run GDB:

```bash
gdb ./main
```

## Commands

```text
break main        stop at main()
break file.cpp:10 stop at line 10
run               start the program
next              next line, do not enter function calls
step              next line, enter function calls
continue          run until next breakpoint or program end
print x           print variable or expression
list              show nearby source code
bt                call stack
quit              exit GDB
```

## Related

- [Build](build)
