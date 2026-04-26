# Stack vs Heap in C

Written by Akshat


---

## Big Picture

In C, memory management is not hidden from us. That is what makes C powerful, but also dangerous if we are careless.

When a C program runs, it needs memory for things like:

- Variables
- Function calls
- Arrays
- Structs
- Dynamically created data
- Pointers
- Return addresses
- Temporary values

Two of the most important memory areas are:

1. **Stack**
2. **Heap**

The simplest way I explain it is this:

> The stack is automatic memory. The heap is manual memory.

If a variable is created normally inside a function, it usually lives on the stack.

If memory is requested using `malloc`, `calloc`, or `realloc`, it lives on the heap.

---

## Why Stack and Heap Matter in C

In languages like Python or Java, memory is mostly managed for us. We create objects and the language runtime handles most cleanup.

In C, we are closer to the machine. That means we need to understand where memory comes from and when it disappears.

This matters because bad memory handling can cause:

- Program crashes
- Random garbage values
- Memory leaks
- Security bugs
- Undefined behaviour
- Stack overflow
- Dangling pointers

A lot of beginner C confusion comes from not understanding the lifetime of variables.

For example:

```c
int *getNumber() {
    int x = 10;
    return &x;
}
```

This looks harmless, but it is wrong. `x` is a local variable on the stack. Once the function ends, `x` is gone. Returning its address gives us a pointer to invalid memory.

That is why stack and heap are not just theory. They directly affect whether the code works.

---

## Memory Layout of a C Program

A running C program is usually divided into different memory sections.

A simplified view looks like this:

```text
High memory addresses

+---------------------------+
|        Stack              |
|  local variables, calls   |
|  grows downward           |
+---------------------------+
|                           |
|      Free memory space    |
|                           |
+---------------------------+
|        Heap               |
|  malloc, calloc, realloc  |
|  grows upward             |
+---------------------------+
|   Uninitialized data      |
|   global/static variables |
|   default value = 0       |
+---------------------------+
|   Initialized data        |
|   global/static variables |
+---------------------------+
|   Text / Code segment     |
|   compiled program code   |
+---------------------------+

Low memory addresses
```

This layout can vary depending on the operating system and compiler, but the idea is the same.

The stack and heap are both used during program execution, but they behave very differently.

---

## What Is the Stack?

The **stack** is a region of memory used for automatic storage.

It stores things like:

- Local variables
- Function parameters
- Return addresses
- Temporary function data

The stack works like a pile of plates.

The last plate placed on top is the first plate removed.

This is called:

> LIFO: Last In, First Out

When a function is called, a new block of memory is added to the stack. This block is called a **stack frame**.

When the function finishes, its stack frame is removed automatically.

Example:

```c
#include <stdio.h>

void greet() {
    int age = 20;
    printf("Age is %d\n", age);
}

int main() {
    greet();
    return 0;
}
```

Here, `age` is stored on the stack. When `greet()` ends, `age` is destroyed automatically.

We do not need to manually delete it.

---

## What Is the Heap?

The **heap** is a region of memory used for dynamic storage.

Dynamic means memory is requested while the program is running.

In C, heap memory is usually created using:

```c
malloc()
calloc()
realloc()
```

And released using:

```c
free()
```

Example:

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *ptr = malloc(sizeof(int));

    if (ptr == NULL) {
        printf("Memory allocation failed\n");
        return 1;
    }

    *ptr = 50;
    printf("Value is %d\n", *ptr);

    free(ptr);
    ptr = NULL;

    return 0;
}
```

Here, the integer itself is stored on the heap. The pointer variable `ptr` is usually stored on the stack, but it holds the address of heap memory.

This is important:

> The pointer can be on the stack while the memory it points to is on the heap.

---

## Stack vs Heap: Main Difference

The stack is managed automatically.

The heap is managed manually.

That is the main idea.

| Feature | Stack | Heap |
|---|---|---|
| Managed by | Compiler and program runtime | Programmer |
| Speed | Faster | Slower |
| Size | Usually smaller | Usually larger |
| Lifetime | Until function ends | Until `free()` is called |
| Used for | Local variables and function calls | Dynamic memory |
| Allocation style | Automatic | Manual |
| Common problem | Stack overflow | Memory leak |
| Access method | Direct variable access | Usually through pointers |
| Flexibility | Less flexible | More flexible |

---

## Stack Memory in Detail

### 1. Stack allocation is automatic

When we write:

```c
int x = 10;
```

inside a function, C automatically reserves memory for `x`.

When the function ends, that memory is automatically released.

Example:

```c
void example() {
    int a = 5;
    int b = 10;
}
```

Both `a` and `b` are local variables. They exist only while `example()` is running.

### 2. Stack is fast

Stack memory is fast because allocation and deallocation are simple.

The program just moves the stack pointer up or down.

It does not need to search for a free block of memory like the heap allocator may need to do.

### 3. Stack has limited size

The stack is usually much smaller than the heap.

This can be a problem if we create very large local arrays.

Bad idea:

```c
int main() {
    int hugeArray[100000000];
    return 0;
}
```

This may crash because the array is too large for the stack.

A better approach would be heap allocation:

```c
#include <stdlib.h>

int main() {
    int *hugeArray = malloc(100000000 * sizeof(int));

    if (hugeArray == NULL) {
        return 1;
    }

    free(hugeArray);
    return 0;
}
```

### 4. Stack frames

Every function call gets its own stack frame.

Example:

```c
#include <stdio.h>

void second() {
    int y = 20;
    printf("Second function: %d\n", y);
}

void first() {
    int x = 10;
    second();
    printf("First function: %d\n", x);
}

int main() {
    first();
    return 0;
}
```

When this program runs, the stack behaves like this:

```text
main() starts

Stack:
+------------------+
| main frame       |
+------------------+

first() is called

Stack:
+------------------+
| first frame      |
+------------------+
| main frame       |
+------------------+

second() is called

Stack:
+------------------+
| second frame     |
+------------------+
| first frame      |
+------------------+
| main frame       |
+------------------+

second() ends

Stack:
+------------------+
| first frame      |
+------------------+
| main frame       |
+------------------+

first() ends

Stack:
+------------------+
| main frame       |
+------------------+

main() ends

Stack is cleared for the program.
```

### 5. Stack variables die when the function returns

This is one of the most important rules.

Incorrect code:

```c
int *badFunction() {
    int number = 99;
    return &number;
}
```

Why is this wrong?

`number` is stored in the stack frame of `badFunction()`.

When `badFunction()` ends, its stack frame is removed.

So the returned address points to memory that is no longer valid.

Correct version using heap:

```c
#include <stdlib.h>

int *goodFunction() {
    int *number = malloc(sizeof(int));

    if (number == NULL) {
        return NULL;
    }

    *number = 99;
    return number;
}
```

Now the memory survives after the function ends because it is on the heap.

But the caller must remember to call `free()`.

---

## Heap Memory in Detail

### 1. Heap allocation is manual

In C, heap memory does not appear automatically. We ask for it.

Example:

```c
int *p = malloc(sizeof(int));
```

This asks the heap for enough memory to store one integer.

The result is a pointer to that memory.

### 2. Heap memory stays alive until freed

Example:

```c
#include <stdlib.h>

int *createNumber() {
    int *p = malloc(sizeof(int));

    if (p == NULL) {
        return NULL;
    }

    *p = 42;
    return p;
}
```

The memory created by `malloc()` is still valid after the function returns.

That is the main reason to use heap memory.

### 3. Heap memory must be freed

If we allocate memory and never free it, we create a memory leak.

Bad code:

```c
#include <stdlib.h>

int main() {
    int *p = malloc(sizeof(int));
    *p = 10;

    return 0;
}
```

This program ends quickly, so the operating system will clean up after it exits. But in a long-running program, this is bad.

Correct code:

```c
#include <stdlib.h>

int main() {
    int *p = malloc(sizeof(int));

    if (p == NULL) {
        return 1;
    }

    *p = 10;

    free(p);
    p = NULL;

    return 0;
}
```

### 4. Heap memory is flexible

The heap is useful when we do not know the required size at compile time.

Example:

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;

    printf("How many numbers? ");
    scanf("%d", &n);

    int *numbers = malloc(n * sizeof(int));

    if (numbers == NULL) {
        printf("Memory allocation failed\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        numbers[i] = i + 1;
    }

    for (int i = 0; i < n; i++) {
        printf("%d ", numbers[i]);
    }

    free(numbers);
    numbers = NULL;

    return 0;
}
```

Here, the array size is decided while the program is running. That is a good use of heap memory.

---

## Code Examples in C

### Example 1: Stack variable

```c
#include <stdio.h>

int main() {
    int x = 10;

    printf("x = %d\n", x);
    printf("Address of x = %p\n", (void *)&x);

    return 0;
}
```

Explanation:

- `x` is a normal local variable.
- It is usually stored on the stack.
- It disappears when `main()` ends.

### Example 2: Heap variable

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int *x = malloc(sizeof(int));

    if (x == NULL) {
        printf("Memory allocation failed\n");
        return 1;
    }

    *x = 10;

    printf("*x = %d\n", *x);
    printf("Address stored in x = %p\n", (void *)x);
    printf("Address of pointer variable x = %p\n", (void *)&x);

    free(x);
    x = NULL;

    return 0;
}
```

Explanation:

- `x` is a pointer variable.
- The pointer variable itself is usually on the stack.
- The memory allocated by `malloc()` is on the heap.
- `*x` means the value stored inside the heap memory.

### Example 3: Stack array

```c
#include <stdio.h>

int main() {
    int numbers[5] = {1, 2, 3, 4, 5};

    for (int i = 0; i < 5; i++) {
        printf("%d\n", numbers[i]);
    }

    return 0;
}
```

Explanation:

- `numbers` is a fixed-size local array.
- It is usually stored on the stack.
- Its size is known in the function.
- It is automatically removed when `main()` ends.

### Example 4: Heap array

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int size = 5;
    int *numbers = malloc(size * sizeof(int));

    if (numbers == NULL) {
        printf("Memory allocation failed\n");
        return 1;
    }

    for (int i = 0; i < size; i++) {
        numbers[i] = i + 1;
    }

    for (int i = 0; i < size; i++) {
        printf("%d\n", numbers[i]);
    }

    free(numbers);
    numbers = NULL;

    return 0;
}
```

Explanation:

- `numbers` is a pointer.
- `malloc()` allocates space for 5 integers on the heap.
- We can use array syntax because pointer arithmetic allows it.
- We must call `free(numbers)` when finished.

### Example 5: Struct on stack

```c
#include <stdio.h>

struct Student {
    int id;
    float grade;
};

int main() {
    struct Student s1;

    s1.id = 1;
    s1.grade = 87.5;

    printf("ID: %d\n", s1.id);
    printf("Grade: %.2f\n", s1.grade);

    return 0;
}
```

Explanation:

- `s1` is a local struct variable.
- It is usually stored on the stack.
- It is automatically destroyed when the function ends.

### Example 6: Struct on heap

```c
#include <stdio.h>
#include <stdlib.h>

struct Student {
    int id;
    float grade;
};

int main() {
    struct Student *s1 = malloc(sizeof(struct Student));

    if (s1 == NULL) {
        printf("Memory allocation failed\n");
        return 1;
    }

    s1->id = 1;
    s1->grade = 87.5;

    printf("ID: %d\n", s1->id);
    printf("Grade: %.2f\n", s1->grade);

    free(s1);
    s1 = NULL;

    return 0;
}
```

Explanation:

- `s1` is a pointer to a struct.
- The actual struct is stored on the heap.
- We use `->` because `s1` is a pointer.
- `s1->id` is the same as `(*s1).id`.

---

## Common Mistakes

### Mistake 1: Returning address of a local stack variable

Wrong:

```c
int *getValue() {
    int x = 10;
    return &x;
}
```

Why it is wrong:

- `x` exists only inside `getValue()`.
- After the function ends, `x` is destroyed.
- The returned pointer becomes invalid.

Correct:

```c
#include <stdlib.h>

int *getValue() {
    int *x = malloc(sizeof(int));

    if (x == NULL) {
        return NULL;
    }

    *x = 10;
    return x;
}
```

The caller must later call:

```c
free(x);
```

### Mistake 2: Forgetting to free heap memory

Wrong:

```c
int *p = malloc(sizeof(int));
*p = 5;
```

Problem:

- Memory was allocated.
- It was never freed.
- This causes a memory leak.

Correct:

```c
int *p = malloc(sizeof(int));

if (p != NULL) {
    *p = 5;
    free(p);
    p = NULL;
}
```

### Mistake 3: Using memory after freeing it

Wrong:

```c
int *p = malloc(sizeof(int));
*p = 10;

free(p);

printf("%d\n", *p);
```

This is called **use after free**.

After `free(p)`, the memory no longer belongs to us. Using it is undefined behaviour.

Better:

```c
free(p);
p = NULL;
```

Now if we accidentally check the pointer, we can see it is `NULL`.

### Mistake 4: Double free

Wrong:

```c
int *p = malloc(sizeof(int));

free(p);
free(p);
```

This is dangerous. We are trying to release the same memory twice.

Better:

```c
free(p);
p = NULL;
```

Calling `free(NULL)` is safe, so setting the pointer to `NULL` helps reduce risk.

### Mistake 5: Not checking if `malloc()` failed

Wrong:

```c
int *p = malloc(sizeof(int));
*p = 10;
```

If `malloc()` fails, it returns `NULL`. Dereferencing `NULL` can crash the program.

Correct:

```c
int *p = malloc(sizeof(int));

if (p == NULL) {
    printf("Memory allocation failed\n");
    return 1;
}

*p = 10;
```

### Mistake 6: Allocating the wrong size

Bad style:

```c
int *arr = malloc(10 * sizeof(int));
```

This works, but a safer style is:

```c
int *arr = malloc(10 * sizeof *arr);
```

Why this is nice:

- It uses the type of what `arr` points to.
- If the pointer type changes later, the allocation is less likely to become wrong.

---

## Stack Overflow vs Memory Leak

These two sound similar to beginners, but they are different problems.

### Stack overflow

Stack overflow happens when the stack grows too much.

Common causes:

- Too many recursive function calls
- Very large local variables
- Huge local arrays

Example:

```c
void infiniteRecursion() {
    infiniteRecursion();
}

int main() {
    infiniteRecursion();
    return 0;
}
```

Each call creates a new stack frame. Since the function never stops calling itself, the stack eventually runs out of space.

### Memory leak

A memory leak happens when heap memory is allocated but not freed.

Example:

```c
#include <stdlib.h>

void leak() {
    int *p = malloc(sizeof(int));
    *p = 10;
}

int main() {
    leak();
    return 0;
}
```

When `leak()` ends, the pointer variable `p` disappears because it was on the stack.

But the heap memory still exists.

Now we have lost the address of that heap memory, so we cannot free it anymore.

That is a memory leak.

---

## Pointers and Memory Addresses

To understand heap memory, we need to understand pointers.

A pointer stores the address of another value.

Example:

```c
int x = 10;
int *p = &x;
```

Here:

- `x` is an integer.
- `&x` means address of `x`.
- `p` stores that address.
- `*p` means go to that address and access the value.

So:

```c
printf("%d\n", x);
printf("%d\n", *p);
```

Both print `10`.

### Pointer to stack memory

```c
int x = 10;
int *p = &x;
```

Here, `p` points to stack memory because `x` is a local variable.

### Pointer to heap memory

```c
int *p = malloc(sizeof(int));
*p = 10;
```

Here, `p` points to heap memory because `malloc()` allocated it.

### Important distinction

The pointer variable and the memory it points to are not always in the same place.

Example:

```c
int *p = malloc(sizeof(int));
```

Usually:

- `p` itself is on the stack.
- The memory returned by `malloc()` is on the heap.

This is one of the biggest beginner confusions.

---

## `malloc`, `calloc`, `realloc`, and `free`

### `malloc`

`malloc` allocates memory but does not initialize it.

```c
int *arr = malloc(5 * sizeof(int));
```

The values inside may be garbage until we assign them.

### `calloc`

`calloc` allocates memory and initializes it to zero.

```c
int *arr = calloc(5, sizeof(int));
```

This creates space for 5 integers and sets them to `0`.

### `realloc`

`realloc` changes the size of previously allocated heap memory.

```c
int *temp = realloc(arr, 10 * sizeof(int));

if (temp == NULL) {
    free(arr);
    return 1;
}

arr = temp;
```

Important point:

Do not directly write this in serious code:

```c
arr = realloc(arr, 10 * sizeof(int));
```

Why?

If `realloc()` fails, it returns `NULL`. Then we lose the original pointer and create a memory leak.

Safer version:

```c
int *temp = realloc(arr, 10 * sizeof(int));

if (temp == NULL) {
    free(arr);
    return 1;
}

arr = temp;
```

### `free`

`free` releases heap memory.

```c
free(arr);
arr = NULL;
```

Only memory allocated by `malloc`, `calloc`, or `realloc` should be passed to `free`.

Wrong:

```c
int x = 10;
free(&x);
```

This is wrong because `x` was not allocated on the heap.

---

## When Should You Use Stack or Heap?

### Use stack when:

- The data is small.
- The size is known in advance.
- The data is only needed inside one function.
- You want simple and fast memory handling.

Example:

```c
int count = 0;
char name[50];
struct Point p;
```

### Use heap when:

- The data is large.
- The size is only known at runtime.
- The data must survive after a function returns.
- You are building dynamic data structures.
- You need flexible memory resizing.

Examples:

- Linked lists
- Trees
- Graphs
- Dynamically sized arrays
- Buffers based on user input

Example:

```c
int *values = malloc(n * sizeof *values);
```

---

## Stack vs Heap With Function Example

### Stack version

```c
#include <stdio.h>

void printArray() {
    int arr[3] = {1, 2, 3};

    for (int i = 0; i < 3; i++) {
        printf("%d ", arr[i]);
    }
}

int main() {
    printArray();
    return 0;
}
```

This is fine because the array is only needed inside `printArray()`.

### Heap version

```c
#include <stdio.h>
#include <stdlib.h>

int *createArray(int size) {
    int *arr = malloc(size * sizeof *arr);

    if (arr == NULL) {
        return NULL;
    }

    for (int i = 0; i < size; i++) {
        arr[i] = i + 1;
    }

    return arr;
}

int main() {
    int size = 3;
    int *arr = createArray(size);

    if (arr == NULL) {
        printf("Memory allocation failed\n");
        return 1;
    }

    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }

    free(arr);
    arr = NULL;

    return 0;
}
```

This needs heap memory because the array is created inside `createArray()` but used later in `main()`.

---

## Teaching Script

This is how I would explain it to a complete beginner.

> Imagine every function gets its own small notebook page. That page is the stack frame. When the function starts, it writes its local variables there. When the function ends, the page is thrown away automatically.

So if I do this:

```c
void test() {
    int x = 5;
}
```

`x` lives only on that function's page. Once `test()` ends, that page is gone.

Now the heap is different.

> The heap is like a storage room. If I want something to stay around after a function ends, I put it in the storage room using `malloc()`. But if I borrow space from the storage room, I must return it using `free()`.

So this:

```c
int *p = malloc(sizeof(int));
```

means:

> Give me enough heap memory to store one integer, and give me the address of that memory.

Then:

```c
*p = 10;
```

means:

> Go to that heap address and store the value 10 there.

And later:

```c
free(p);
```

means:

> I am done with that heap memory. Give it back.

The dangerous part is this:

If we forget `free(p)`, the memory stays taken. That is a memory leak.

If we use `p` after `free(p)`, we are touching memory that no longer belongs to us. That is undefined behaviour.

---

## Practice Questions

### Question 1

Where is `x` usually stored?

```c
void func() {
    int x = 10;
}
```

Answer: Stack.

Reason: `x` is a local variable inside a function.

### Question 2

Where is the memory for `p` pointing to?

```c
int *p = malloc(sizeof(int));
```

Answer: Heap.

Reason: `malloc()` allocates memory from the heap.

### Question 3

Is this code safe?

```c
int *getX() {
    int x = 5;
    return &x;
}
```

Answer: No.

Reason: `x` is a local stack variable. It disappears when the function ends.

### Question 4

What is wrong here?

```c
int *p = malloc(sizeof(int));
*p = 10;
```

Answer: The memory is never freed.

Correct version:

```c
int *p = malloc(sizeof(int));

if (p != NULL) {
    *p = 10;
    free(p);
    p = NULL;
}
```

### Question 5

What is wrong here?

```c
int *p = malloc(sizeof(int));
free(p);
printf("%d", *p);
```

Answer: It uses memory after freeing it.

That is undefined behaviour.

### Question 6

Why might this crash?

```c
int arr[100000000];
```

Answer: The array is too large for the stack.

A heap allocation would be more suitable.

### Question 7

Why should we check if `malloc()` returns `NULL`?

Answer: Because allocation can fail. If it fails, `malloc()` returns `NULL`, and dereferencing `NULL` can crash the program.

---

## Quick Revision Table

| Concept | Meaning |
|---|---|
| Stack | Automatic memory used for function calls and local variables |
| Heap | Dynamic memory manually allocated by the programmer |
| Stack frame | Memory block created for a function call |
| `malloc()` | Allocates heap memory without initializing it |
| `calloc()` | Allocates heap memory and initializes it to zero |
| `realloc()` | Resizes heap memory |
| `free()` | Releases heap memory |
| Memory leak | Heap memory is allocated but never freed |
| Dangling pointer | Pointer points to memory that is no longer valid |
| Stack overflow | Stack runs out of space |
| Use after free | Accessing heap memory after it has been freed |
| Double free | Calling `free()` twice on the same allocation |

---

## Final Summary

The stack and heap are both parts of memory used by a C program, but they are used for different reasons.

The stack is simple, fast, and automatic. It is perfect for normal local variables, function calls, and small fixed-size data.

The heap is more flexible and useful for data that is large, dynamic, or needs to survive after a function ends. But heap memory comes with responsibility. If we allocate it, we must free it.

The main rule I would remember is:

> Stack memory belongs to the function. Heap memory belongs to the programmer.

If a variable only needs to exist inside one function, stack is usually fine.

If data needs to live longer, have a runtime size, or be shared across functions, heap may be the correct choice.

In C, understanding this difference is a big step toward writing code that actually behaves properly instead of randomly crashing or leaking memory.

---

## Mini Cheat Sheet

```c
// Stack variable
int x = 10;

// Heap variable
int *p = malloc(sizeof *p);

if (p == NULL) {
    return 1;
}

*p = 10;

free(p);
p = NULL;
```

Remember:

- Normal local variables usually live on the stack.
- `malloc`, `calloc`, and `realloc` create heap memory.
- Every successful heap allocation should eventually have a matching `free`.
- Never return the address of a local stack variable.
- Never use memory after calling `free` on it.
- Always check whether allocation failed.
