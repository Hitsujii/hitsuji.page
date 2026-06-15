---
title: Workflow
---

# Workflow

## Build

```bash
cmake -S . -B build
cmake --build build
```

## Test

```bash
ctest --test-dir build --output-on-failure
```

## Submit

```bash
exercism submit *.cpp *.h
```
