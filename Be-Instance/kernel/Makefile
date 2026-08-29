# ============================================================================
# kernel/Makefile
# Standalone Zero-Dependency C23 / ANSI C Native Kernel Build System
# Invariant: 1 == 1
# ============================================================================

CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -O3 -fPIC -I.
WASM_CC ?= emcc

SOURCES = $(wildcard *.c)
HEADERS = $(wildcard *.h)
OBJS = $(SOURCES:.c=.o)

all: test_runner libcovalent_kernel.a

libcovalent_kernel.a: covalent_kernel_amalgamation.o
	ar rcs $@ $^

covalent_kernel_amalgamation.o: covalent_kernel_amalgamation.c $(HEADERS)
	$(CC) $(CFLAGS) -c $< -o $@

test_runner: covalent_test_runner.c covalent_kernel_amalgamation.o
	$(CC) $(CFLAGS) $^ -o $@

test: test_runner
	./test_runner

clean:
	rm -f *.o *.a test_runner

.PHONY: all test clean

