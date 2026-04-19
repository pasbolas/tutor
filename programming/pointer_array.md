# Chapter: Arrays, Pointers, and Dynamic Memory in C

---

## 1. Foundations: Thinking in Memory

C is a low-level language. This means:

- You control memory directly
- You decide where data goes
- You manage how long data lives

Everything in this chapter revolves around one idea:

> Programs are just operations on memory.

---

## 2. Arrays

### 2.1 Definition

An array is a collection of elements stored in contiguous memory.

```c
int a[5];
```

This creates:

a[0], a[1], a[2], a[3], a[4]

---

### 2.2 Memory Layout

Memory looks like a sequence:

Index:   0   1   2   3   4  
Address: 1000 1004 1008 1012 1016  

Each element is stored next to the previous one.

---

### 2.3 Key Rule

```c
a == &a[0]
```

Array name is the address of first element.

---

## 3. Pointers

### 3.1 Definition

A pointer stores an address.

```c
int x = 10;
int *p = &x;
```

- p stores address of x
- *p gives value

---

### 3.2 Dereferencing

```c
*p
```

Means "go to that address and get value"

---

### 3.3 Pointer Arithmetic

```c
p + 1
```

Moves forward by size of data type.

If int = 4 bytes:

- p → 1000
- p+1 → 1004

---

## 4. Arrays + Pointers

### Core Identity

```c
a[i] == *(a + i)
```

Two ways, same thing.

---

### Example

```c
for(int i = 0; i < 5; i++)
{
    printf("%d", *(a + i));
}
```

---

## 5. Stack vs Heap

### Stack
- automatic memory
- used for variables
- fast
- fixed size

### Heap
- dynamic memory
- used via malloc/calloc
- flexible
- must be managed manually

---

## 6. Dynamic Memory Allocation

### Why?

When size is unknown at compile time.

---

## 7. malloc

```c
ptr = malloc(n * sizeof(int));
```

- allocates memory
- returns pointer
- contains garbage

---

## 8. calloc

```c
ptr = calloc(n, sizeof(int));
```

- initializes memory to zero

---

## 9. realloc

```c
ptr = realloc(ptr, new_size);
```

- resizes memory block

---

## 10. free

```c
free(ptr);
```

- releases memory

---

## 11. Common Bugs

### Memory leak
Forgetting free

### Dangling pointer
Using pointer after free

### Null pointer
Not checking malloc

---

## 12. Mental Model

Memory = boxes

- array → fixed boxes
- pointer → location
- malloc → new boxes
- free → return boxes

---

## 13. Final Insight

Arrays, pointers, and DMA are one system:

> Memory + Address + Access
