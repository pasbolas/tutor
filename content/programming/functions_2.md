# C Functions: Parameter Passing, Pointers, and Arrays

---

# 1. Parameter Passing in C

When a value is given to a function, it is called parameter passing. In C, this normally happens in two practical ways:

1. passing a copy of a value
2. passing the address of a variable

These are usually called:

- pass by value
- pass by reference

Strictly speaking, C passes arguments by value. What beginners call pass by reference in C is done by passing an address value into a pointer parameter. The function receives a copy of the address, but that copied address still points to the original variable.

That is the key idea:

```text
C does not directly pass the original variable.
C can pass the address of the original variable.
The address lets the function reach and modify the original variable.
```

---

# 2. Pass by Value

## 2.1 Meaning

Pass by value means the function receives a copy of the argument.

The original variable and the function parameter are separate variables stored in separate memory locations.

Changing the parameter inside the function does not change the original variable in the caller.

## 2.2 Example

```c
#include <stdio.h>

void fxn1(int);

int main()
{
    int num = 0;

    printf("Enter any number\n");
    scanf("%d", &num);

    fxn1(num);

    printf("\nnum contains %d", num);

    return 0;
}

void fxn1(int n1)
{
    printf("\nn1 contains %d\n", n1);

    n1++;

    printf("\nn1 contains %d\n", n1);
}
```

## 2.3 Step-by-Step Trace

Assume the user enters:

```text
5
```

In `main`:

```c
int num = 5;
```

The function call is:

```c
fxn1(num);
```

This copies the value of `num` into `n1`.

```text
num = 5
n1  = 5
```

Inside the function:

```c
n1++;
```

Now:

```text
num = 5
n1  = 6
```

The original `num` has not changed.

When the function finishes, `n1` disappears because it is local to the function.

Back in `main`, this line:

```c
printf("\nnum contains %d", num);
```

prints:

```text
num contains 5
```

## 2.4 Memory View

Before the function call:

```text
main:
num = 5
```

During the function call:

```text
main:       num = 5
fxn1:       n1  = 5
```

After `n1++`:

```text
main:       num = 5
fxn1:       n1  = 6
```

`num` and `n1` are different variables.

## 2.5 What Pass by Value Is Good For

Pass by value is good when the function only needs to use a value, not change the original variable.

Example:

```c
int square(int x)
{
    return x * x;
}
```

The function only needs the value of `x`. It does not need to modify the original variable that was passed in.

## 2.6 Important Points

- A copy is passed.
- The original variable is not changed.
- The function parameter has its own memory location.
- It is safe for read-only operations.
- It is commonly used with simple data types such as `int`, `float`, `char`, and `double`.

---

# 3. Pass by Reference Using Pointers

## 3.1 Meaning

Pass by reference means the function can access the original variable by using its memory address.

In C, this is done using pointers.

Instead of passing the variable itself:

```c
fxn1(num);
```

pass the address of the variable:

```c
fxn1(&num);
```

The receiving function must use a pointer parameter:

```c
void fxn1(int *n1)
```

## 3.2 Address-of Operator `&`

The `&` operator gives the address of a variable.

Example:

```c
int num = 5;
```

Then:

```c
&num
```

means:

```text
the memory address of num
```

This is why `scanf` uses `&` with normal variables:

```c
scanf("%d", &num);
```

`scanf` needs to know where to store the input.

## 3.3 Pointer Parameter `int *`

A pointer stores an address.

```c
int *n1;
```

means:

```text
n1 is a pointer to an integer
```

A pointer parameter like this:

```c
void fxn1(int *n1)
```

means:

```text
fxn1 expects the address of an integer
```

So this call is correct:

```c
fxn1(&num);
```

because `&num` is the address of an integer.

## 3.4 Dereference Operator `*`

When `*` is used with a pointer variable, it accesses the value stored at the address inside that pointer.

If:

```c
int num = 5;
int *p = &num;
```

then:

```c
*p
```

means:

```text
the value stored at the address p is pointing to
```

Since `p` points to `num`, `*p` means the actual value of `num`.

## 3.5 Full Example

```c
#include <stdio.h>

void fxn1(int *);

int main()
{
    int num = 0;

    printf("Enter any number\n");
    scanf("%d", &num);

    fxn1(&num);

    printf("\nnum contains %d", num);

    return 0;
}

void fxn1(int *n1)
{
    printf("\nn1 contains %d\n", *n1);

    (*n1)++;

    printf("\nn1 contains %d\n", *n1);
}
```

## 3.6 Step-by-Step Trace

Assume the user enters:

```text
5
```

In `main`:

```c
num = 5;
```

The function call is:

```c
fxn1(&num);
```

This passes the address of `num`.

Inside the function:

```c
void fxn1(int *n1)
```

`n1` receives the address of `num`.

So:

```text
num = 5
n1 = address of num
*n1 = 5
```

This line:

```c
(*n1)++;
```

means:

```text
Go to the address stored in n1 and increase the integer value stored there.
```

Because `n1` points to `num`, the original `num` changes.

Now:

```text
num = 6
*n1 = 6
```

Back in `main`, this prints:

```text
num contains 6
```

## 3.7 Memory View

Suppose `num` is stored at address `1000`:

```text
Address: 1000
Variable: num
Value: 5
```

The call:

```c
fxn1(&num);
```

passes `1000` to the function.

Inside the function:

```text
n1 = 1000
*n1 = value at address 1000
```

So changing `*n1` changes `num`.

---

# 4. Why `(*n1)++` Needs Parentheses

This is one of the most important pointer mistakes.

Correct:

```c
(*n1)++;
```

This means:

```text
increase the value pointed to by n1
```

Incorrect for this purpose:

```c
*n1++;
```

Because of operator precedence, this is treated like:

```c
*(n1++);
```

That means:

```text
use the pointer, then move the pointer to another memory location
```

It does not simply increment the original integer value.

## 4.1 Comparison

| Expression | Meaning |
|---|---|
| `(*n1)++` | increment the value pointed to by `n1` |
| `*n1++` | increment the pointer, not the original value in the intended way |
| `n1++` | move the pointer to the next memory position |
| `*n1` | access the value pointed to by `n1` |

## 4.2 Rule to Remember

When the goal is to change the original integer through a pointer, use:

```c
(*pointer_name)++;
```

not:

```c
*pointer_name++;
```

---

# 5. Comparing Pass by Value and Pass by Reference

| Feature | Pass by Value | Pass by Reference Using Pointers |
|---|---|---|
| What is passed? | Copy of the value | Address of the original variable |
| Can the original variable change? | No | Yes |
| Function parameter type | Normal variable | Pointer variable |
| Function call uses `&`? | No | Usually yes |
| Function body uses `*`? | No | Yes, to access the original value |
| Safer from accidental changes? | Yes | No |
| Useful for modifying caller variables? | No | Yes |

## 5.1 Side-by-Side Code

### Pass by Value

```c
void change(int x)
{
    x = 100;
}

int main()
{
    int num = 5;
    change(num);
    printf("%d", num);    // prints 5
    return 0;
}
```

### Pass by Reference Using a Pointer

```c
void change(int *x)
{
    *x = 100;
}

int main()
{
    int num = 5;
    change(&num);
    printf("%d", num);    // prints 100
    return 0;
}
```

---

# 6. Passing a 1-D Array to a Function

## 6.1 Meaning

A 1-D array can be passed to a function by writing only the array name in the function call.

Example:

```c
sum = sum_array(values);
```

The array name is enough.

Do not write:

```c
sum = sum_array(values[0]);
```

That passes only one element.

Do not write:

```c
sum = sum_array(values[SIZE]);
```

That tries to access an invalid element if `SIZE` is the length of the array.

For an array of size 5, the valid indexes are:

```text
0, 1, 2, 3, 4
```

`values[5]` is outside the array.

## 6.2 Key Rule

In C, the name of an array represents the address of its first element.

```c
values
```

is closely related to:

```c
&values[0]
```

So when this is written:

```c
sum_array(values);
```

C passes the address of the first element of the array.

That is why arrays are effectively passed by reference.

## 6.3 Function Prototype Using Array Notation

```c
int sum_array(int []);
```

This says the function receives a 1-D integer array and returns an integer.

A named version is also valid:

```c
int sum_array(int arr[]);
```

## 6.4 Complete 1-D Array Sum Example

```c
#include <stdio.h>
#define SIZE 5

int sum_array(int []);

int main()
{
    int values[SIZE];
    int i;
    int sum = 0;

    printf("Enter %d numbers\n", SIZE);

    for(i = 0; i < SIZE; i++)
    {
        scanf("%d", &values[i]);
    }

    sum = sum_array(values);

    printf("\nThe sum of the array is %d", sum);

    return 0;
}

int sum_array(int my_array[])
{
    int total = 0;
    int i;

    for(i = 0; i < SIZE; i++)
    {
        total = total + my_array[i];
    }

    return total;
}
```

## 6.5 Step-by-Step Explanation

The array is declared:

```c
int values[SIZE];
```

If `SIZE` is 5, the array has 5 elements.

The loop reads values into the array:

```c
for(i = 0; i < SIZE; i++)
{
    scanf("%d", &values[i]);
}
```

Each `values[i]` is a single integer element, so `scanf` needs `&values[i]`.

The array is passed to the function:

```c
sum = sum_array(values);
```

The function receives it:

```c
int sum_array(int my_array[])
```

The function loops through all elements:

```c
for(i = 0; i < SIZE; i++)
{
    total = total + my_array[i];
}
```

The final total is returned:

```c
return total;
```

## 6.6 Example Run

Input:

```text
2 4 6 8 10
```

Array contents:

```text
values[0] = 2
values[1] = 4
values[2] = 6
values[3] = 8
values[4] = 10
```

Sum:

```text
2 + 4 + 6 + 8 + 10 = 30
```

Output:

```text
The sum of the array is 30
```

---

# 7. Passing a 1-D Array Using Pointer Notation

## 7.1 Why Pointer Notation Works

Since the array name gives the address of the first element, a function can receive the array using a pointer parameter.

These two prototypes are equivalent for a 1-D integer array:

```c
int sum_array(int arr[]);
```

```c
int sum_array(int *arr);
```

Both mean the function can access the array elements through the address of the first element.

## 7.2 Complete Pointer Version

```c
#include <stdio.h>
#define SIZE 5

int sum_array(int *);

int main()
{
    int values[SIZE];
    int i;
    int sum = 0;

    printf("Enter %d numbers\n", SIZE);

    for(i = 0; i < SIZE; i++)
    {
        scanf("%d", &values[i]);
    }

    sum = sum_array(values);

    printf("\nThe sum of the array is %d", sum);

    return 0;
}

int sum_array(int *my_array)
{
    int total = 0;
    int i;

    for(i = 0; i < SIZE; i++)
    {
        total = total + *(my_array + i);
    }

    return total;
}
```

## 7.3 Understanding `*(my_array + i)`

This expression:

```c
*(my_array + i)
```

means:

```text
start at the address of the first element, move forward i elements, then access the value there
```

It is equivalent to:

```c
my_array[i]
```

Examples:

```c
my_array[0] == *(my_array + 0)
my_array[1] == *(my_array + 1)
my_array[2] == *(my_array + 2)
```

## 7.4 Array Notation and Pointer Notation

| Array notation | Pointer notation | Meaning |
|---|---|---|
| `my_array[0]` | `*(my_array + 0)` | first element |
| `my_array[1]` | `*(my_array + 1)` | second element |
| `my_array[2]` | `*(my_array + 2)` | third element |
| `my_array[i]` | `*(my_array + i)` | element at index `i` |

Array notation is usually clearer. Pointer notation shows what C is doing underneath.

---

# 8. Arrays Are Effectively Passed by Reference

## 8.1 Main Idea

When a normal integer is passed to a function, a copy of the value is passed.

When an array is passed to a function, the address of the first element is passed.

That means the function can access the original array.

## 8.2 Modifying an Array Inside a Function

```c
#include <stdio.h>
#define SIZE 5

void change_array(int arr[]);

int main()
{
    int values[SIZE] = {1, 2, 3, 4, 5};
    int i;

    change_array(values);

    for(i = 0; i < SIZE; i++)
    {
        printf("%d ", values[i]);
    }

    return 0;
}

void change_array(int arr[])
{
    arr[0] = 99;
}
```

Output:

```text
99 2 3 4 5
```

The original array changed because `arr` refers to the same array memory as `values`.

## 8.3 Important Warning

If a function changes an array parameter, the original array changes.

Example:

```c
void reset_first(int arr[])
{
    arr[0] = 0;
}
```

Calling this function changes the first element of the original array.

---

# 9. Array Size and Function Parameters

## 9.1 A Function Does Not Automatically Know the Size of a 1-D Array

When an array is passed into a function, the function receives an address.

It does not automatically receive the number of elements.

This function:

```c
int sum_array(int arr[])
```

cannot reliably know how many elements are in `arr` unless the size is provided another way.

## 9.2 Better Version: Pass the Size Separately

```c
#include <stdio.h>

int sum_array(int arr[], int size);

int main()
{
    int values[5] = {2, 4, 6, 8, 10};
    int sum;

    sum = sum_array(values, 5);

    printf("Sum = %d", sum);

    return 0;
}

int sum_array(int arr[], int size)
{
    int total = 0;
    int i;

    for(i = 0; i < size; i++)
    {
        total = total + arr[i];
    }

    return total;
}
```

## 9.3 Why This Version Is Better

This version can work with different array sizes.

Example:

```c
int a[3] = {1, 2, 3};
int b[5] = {1, 2, 3, 4, 5};

printf("%d", sum_array(a, 3));
printf("%d", sum_array(b, 5));
```

The function does not depend on one fixed `#define SIZE` value.

---

# 10. Passing a 2-D Array to a Function

## 10.1 Meaning

A 2-D array has rows and columns.

Example:

```c
int values[2][3];
```

This means:

```text
2 rows
3 columns
6 total elements
```

The elements are accessed using two indexes:

```c
values[row][column]
```

Example:

```c
values[0][0]
values[0][1]
values[0][2]
values[1][0]
values[1][1]
values[1][2]
```

## 10.2 Function Prototype for a 2-D Array

When passing a 2-D array to a function, the number of columns must be stated.

Example:

```c
int sum_array(int [][COL]);
```

or:

```c
int sum_array(int my_array[][COL]);
```

The row size can be omitted in the parameter.

The column size cannot be omitted.

## 10.3 Correct and Incorrect Forms

Correct:

```c
int sum_array(int arr[][COL]);
```

Correct:

```c
int sum_array(int arr[ROW][COL]);
```

Also valid:

```c
int sum_array(int (*arr)[COL]);
```

Incorrect:

```c
int sum_array(int arr[][]);
```

The incorrect version fails because the compiler does not know how many columns are in each row.

---

# 11. Why the Column Size Is Required

C stores a 2-D array in memory row by row.

Example:

```c
int values[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};
```

Conceptually, this looks like:

```text
Row 0: 1 2 3
Row 1: 4 5 6
```

But in memory, it is stored like:

```text
1 2 3 4 5 6
```

To access:

```c
values[i][j]
```

C needs to calculate the correct position.

The formula is:

```text
position = i * number_of_columns + j
```

For:

```c
values[1][2]
```

with 3 columns:

```text
position = 1 * 3 + 2
position = 5
```

That is the sixth element in memory.

Without knowing the number of columns, C cannot calculate where each row starts.

---

# 12. Complete 2-D Array Sum Example

```c
#include <stdio.h>
#define ROW 2
#define COL 3

int sum_array(int [][COL]);

int main()
{
    int values[ROW][COL];
    int i, j;
    int sum = 0;

    printf("Enter %d numbers\n", ROW * COL);

    for(i = 0; i < ROW; i++)
    {
        for(j = 0; j < COL; j++)
        {
            scanf("%d", &values[i][j]);
        }
    }

    sum = sum_array(values);

    printf("\nThe sum of the array is %d\n", sum);

    return 0;
}

int sum_array(int my_array[][COL])
{
    int total = 0;
    int i, j;

    for(i = 0; i < ROW; i++)
    {
        for(j = 0; j < COL; j++)
        {
            total = total + my_array[i][j];
        }
    }

    return total;
}
```

## 12.1 Step-by-Step Explanation

The constants are defined:

```c
#define ROW 2
#define COL 3
```

The array is declared:

```c
int values[ROW][COL];
```

This means:

```c
int values[2][3];
```

The program reads:

```c
ROW * COL
```

values.

Since:

```text
2 * 3 = 6
```

it reads 6 integers.

The outer loop controls the rows:

```c
for(i = 0; i < ROW; i++)
```

The inner loop controls the columns:

```c
for(j = 0; j < COL; j++)
```

Each input is stored here:

```c
scanf("%d", &values[i][j]);
```

The array is passed to the function:

```c
sum = sum_array(values);
```

The function receives it here:

```c
int sum_array(int my_array[][COL])
```

The nested loops add every element:

```c
for(i = 0; i < ROW; i++)
{
    for(j = 0; j < COL; j++)
    {
        total = total + my_array[i][j];
    }
}
```

Finally, the total is returned:

```c
return total;
```

## 12.2 Example Run

Input:

```text
1 2 3 4 5 6
```

Array contents:

```text
Row 0: 1 2 3
Row 1: 4 5 6
```

Sum:

```text
1 + 2 + 3 + 4 + 5 + 6 = 21
```

Output:

```text
The sum of the array is 21
```

---

# 13. Nested Loops for 2-D Arrays

A 2-D array usually needs nested loops.

General pattern:

```c
for(i = 0; i < ROW; i++)
{
    for(j = 0; j < COL; j++)
    {
        // use array[i][j]
    }
}
```

The outer loop moves through the rows.

The inner loop moves through the columns inside the current row.

For `ROW = 2` and `COL = 3`, traversal happens like this:

```text
i = 0, j = 0 -> values[0][0]
i = 0, j = 1 -> values[0][1]
i = 0, j = 2 -> values[0][2]
i = 1, j = 0 -> values[1][0]
i = 1, j = 1 -> values[1][1]
i = 1, j = 2 -> values[1][2]
```

---

# 14. More Flexible 2-D Array Function

The column size still needs to be known, but the number of rows can be passed separately.

```c
#include <stdio.h>
#define COL 3

int sum_array(int arr[][COL], int rows);

int main()
{
    int values[2][COL] = {
        {1, 2, 3},
        {4, 5, 6}
    };

    int sum;

    sum = sum_array(values, 2);

    printf("Sum = %d", sum);

    return 0;
}

int sum_array(int arr[][COL], int rows)
{
    int total = 0;
    int i, j;

    for(i = 0; i < rows; i++)
    {
        for(j = 0; j < COL; j++)
        {
            total = total + arr[i][j];
        }
    }

    return total;
}
```

This is more flexible than fixing both `ROW` and `COL` inside the function.

---

# 15. `scanf` with Arrays

## 15.1 Normal Variable

For a normal integer variable:

```c
int num;
scanf("%d", &num);
```

The `&` is needed because `scanf` must store input into the memory address of `num`.

## 15.2 1-D Array Element

For one array element:

```c
scanf("%d", &values[i]);
```

`values[i]` is an integer element, not an address, so `&` is needed.

Equivalent form:

```c
scanf("%d", &*(values + i));
```

Since:

```c
values[i] == *(values + i)
```

then:

```c
&values[i] == &*(values + i)
```

## 15.3 2-D Array Element

For a 2-D array element:

```c
scanf("%d", &values[i][j]);
```

`values[i][j]` is a single integer element, so its address is needed.

---

# 16. Useful Things to Remember

## 16.1 Pass by Value

- A copy of the value is passed.
- The function cannot directly modify the original variable.
- The parameter and original variable are separate.
- Changes to the parameter disappear when the function ends.

## 16.2 Pass by Reference Using Pointers

- The address of the original variable is passed.
- The function parameter must be a pointer.
- The function call usually uses `&`.
- The function body uses `*` to access the original value.
- Changes through the dereferenced pointer affect the original variable.

## 16.3 1-D Arrays in Functions

- Pass the array name only.
- The array name represents the address of the first element.
- 1-D arrays are effectively passed by reference.
- Changes inside the function affect the original array.
- The function does not automatically know the array length.
- Passing the array size as a separate parameter is usually better.

## 16.4 2-D Arrays in Functions

- Pass the array name only.
- The function parameter must include the number of columns.
- The number of rows may be omitted.
- Nested loops are normally used to process rows and columns.
- `int arr[][]` is not valid as a function parameter because the column size is missing.

## 16.5 Pointer and Array Equivalence

For a 1-D array:

```c
arr[i] == *(arr + i)
```

and:

```c
arr == &arr[0]
```

---

# 17. Common Mistakes

## 17.1 Passing a Value When a Pointer Is Expected

Incorrect:

```c
fxn1(num);
```

if the function expects:

```c
void fxn1(int *n1);
```

Correct:

```c
fxn1(&num);
```

## 17.2 Forgetting to Dereference the Pointer

Incorrect:

```c
n1++;
```

This moves the pointer.

Correct:

```c
(*n1)++;
```

This changes the value pointed to by the pointer.

## 17.3 Writing `*n1++` Instead of `(*n1)++`

Incorrect for incrementing the original integer:

```c
*n1++;
```

Correct:

```c
(*n1)++;
```

## 17.4 Passing One Array Element Instead of the Whole Array

Incorrect:

```c
sum_array(values[0]);
```

Correct:

```c
sum_array(values);
```

## 17.5 Passing `values[SIZE]`

Incorrect:

```c
sum_array(values[SIZE]);
```

If `SIZE` is 5, `values[5]` is outside the array.

Correct:

```c
sum_array(values);
```

## 17.6 Assuming Arrays Behave Like Normal Pass-by-Value Variables

This changes the original array:

```c
void change(int arr[])
{
    arr[0] = 100;
}
```

Arrays are not copied into the function.

## 17.7 Omitting the Column Size in a 2-D Array Parameter

Incorrect:

```c
int sum_array(int arr[][]);
```

Correct:

```c
int sum_array(int arr[][COL]);
```

## 17.8 Using the Wrong Loop Condition

Incorrect:

```c
for(i = 0; i <= SIZE; i++)
```

For an array of size 5, this accesses index `5`, which is invalid.

Correct:

```c
for(i = 0; i < SIZE; i++)
```

## 17.9 Forgetting to Initialise a Running Total

Incorrect:

```c
int total;
total = total + arr[i];
```

`total` may contain a garbage value.

Correct:

```c
int total = 0;
total = total + arr[i];
```

## 17.10 Mismatching Prototype and Definition

Incorrect:

```c
int sum_array(int []);

void sum_array(int arr[])
{
    // code
}
```

Correct:

```c
int sum_array(int []);

int sum_array(int arr[])
{
    // code
}
```

---

# 18. Theory Questions

## 18.1 Short Questions

1. What is pass by value?
2. What is pass by reference?
3. How is pass by reference achieved in C?
4. What does the `&` operator do?
5. What does the `*` operator do when used with a pointer?
6. What does `int *p` mean?
7. What does `*p` mean?
8. What does `&num` mean?
9. Why does changing a pass-by-value parameter not change the original variable?
10. Why can changing `*p` change the original variable?
11. Why is `(*p)++` different from `*p++`?
12. How do you pass a 1-D array to a function?
13. What does an array name represent in C?
14. Why are arrays effectively passed by reference?
15. What happens if a function modifies an array parameter?
16. Why should a 1-D array size often be passed separately?
17. How do you pass a 2-D array to a function?
18. Why must the number of columns be specified for a 2-D array parameter?
19. Why is `int arr[][]` invalid as a 2-D array function parameter?
20. What is the relationship between `arr[i]` and `*(arr + i)`?
21. What is the valid index range for `int arr[10];`?
22. Why is `arr[10]` invalid for `int arr[10];`?
23. Why do 2-D arrays usually require nested loops?
24. What is the purpose of `return total;` in a sum function?
25. Why must a running total usually be initialised to `0`?

## 18.2 Longer Questions

1. Explain pass by value using a small code example.
2. Explain pass by reference using a pointer-based code example.
3. Compare pass by value and pass by reference in C.
4. Explain what happens in memory when `fxn1(&num)` is called.
5. Explain why `(*p)++` is needed to increment the value pointed to by `p`.
6. Explain how a 1-D array is passed to a function.
7. Explain why modifying an array inside a function modifies the original array.
8. Explain the difference between `arr[i]` and `*(arr + i)`.
9. Explain why a function should often receive both an array and its size.
10. Explain how a function can calculate the sum of a 1-D array.
11. Explain how a 2-D array is stored in memory.
12. Explain why the column size is required when passing a 2-D array.
13. Explain how nested loops process a 2-D array.
14. Explain the risk of using `<=` instead of `<` in an array loop.
15. Explain how `scanf("%d", &values[i][j]);` works with a 2-D array.

## 18.3 True or False

1. Pass by value passes a copy of the argument.
2. A pass-by-value function can directly change the original variable.
3. C uses pointers to achieve reference-like behaviour.
4. `&num` gives the address of `num`.
5. `*p` gives the address stored in `p`.
6. `*p` accesses the value at the address stored in `p`.
7. `(*p)++` increments the value pointed to by `p`.
8. `*p++` always means the same thing as `(*p)++`.
9. A 1-D array can be passed using only its name.
10. An array name represents the address of its first element.
11. A function automatically knows the size of a 1-D array parameter.
12. Arrays are effectively passed by reference in C.
13. Modifying `arr[0]` inside a function can modify the original array.
14. A 2-D array function parameter can be written as `int arr[][]`.
15. A 2-D array function parameter must include the number of columns.

## 18.4 Fill in the Blanks

1. Pass by value passes a ________ of the variable.
2. Pass by reference passes the ________ of the variable.
3. The `&` operator gives the ________ of a variable.
4. The `*` operator can be used to ________ a pointer.
5. A pointer stores a ________.
6. In C, an array name represents the address of the ________ element.
7. Array indexes start at ________.
8. For `int arr[5];`, the last valid index is ________.
9. `arr[i]` is equivalent to ________.
10. When passing a 2-D array to a function, the number of ________ must be specified.

---

# 19. Coding Questions

## 19.1 Pass by Value and Pointer Questions

1. Write a function that receives an integer by value and prints it.
2. Write a function that receives an integer by value and adds 10 to it. Print the value before and after the function call in `main`.
3. Write a function that receives an integer by reference and adds 10 to it.
4. Write a function that receives an integer by reference and sets it to `0`.
5. Write a function that receives two integers by reference and swaps them.
6. Write a function that receives two integers by reference and stores the larger value in the first variable and the smaller value in the second variable.
7. Write a program that shows the difference between pass by value and pass by reference using the same starting value.
8. Write a function called `doubleValue` that doubles the original integer using a pointer.
9. Write a function called `makePositive` that changes a negative integer to positive using a pointer.
10. Write a function called `resetIfNegative` that sets an integer to `0` only if it is negative.

## 19.2 1-D Array Questions

1. Write a function that receives a 1-D integer array and prints all elements.
2. Write a function that receives a 1-D integer array and returns the sum of all elements.
3. Write a function that receives a 1-D integer array and returns the largest element.
4. Write a function that receives a 1-D integer array and returns the smallest element.
5. Write a function that receives a 1-D integer array and counts how many elements are even.
6. Write a function that receives a 1-D integer array and counts how many elements are odd.
7. Write a function that receives a 1-D integer array and counts how many elements are negative.
8. Write a function that receives a 1-D integer array and changes every element to `0`.
9. Write a function that receives a 1-D integer array and doubles every element.
10. Write a function that receives a 1-D integer array and replaces every negative value with `0`.
11. Write a function that receives a 1-D integer array and returns the index of the largest element.
12. Write a function that receives a 1-D integer array and reverses the array.
13. Write a function that receives two arrays of the same size and stores their element-by-element sum in a third array.
14. Write a function that calculates the sum of a 1-D array using pointer notation only.
15. Write a function that prints a 1-D array using pointer notation only.

## 19.3 2-D Array Questions

1. Write a function that receives a 2-D array and prints all elements in row-column format.
2. Write a function that receives a 2-D array and returns the sum of all elements.
3. Write a function that receives a 2-D array and returns the largest element.
4. Write a function that receives a 2-D array and returns the smallest element.
5. Write a function that receives a 2-D array and counts how many elements are even.
6. Write a function that receives a 2-D array and counts how many elements are negative.
7. Write a function that receives a 2-D array and replaces all negative values with `0`.
8. Write a function that receives a 2-D array and calculates the sum of each row.
9. Write a function that receives a 2-D array and calculates the sum of each column.
10. Write a function that receives a 2-D array and prints the largest value in each row.
11. Write a function that receives a square 2-D array and prints the main diagonal.
12. Write a function that receives a square 2-D array and calculates the sum of the main diagonal.
13. Write a function that receives a 2-D array and counts how many values are greater than 50.
14. Write a function that receives a 2-D array and returns the average of all values.
15. Write a function that receives two 2-D arrays of the same size and stores their sum in a third 2-D array.

---

# 20. Code Tracing Questions

## 20.1 Trace Question 1

What is the output?

```c
#include <stdio.h>

void test(int x)
{
    x = x + 5;
    printf("%d\n", x);
}

int main()
{
    int num = 10;
    test(num);
    printf("%d\n", num);
    return 0;
}
```

## 20.2 Trace Question 2

What is the output?

```c
#include <stdio.h>

void test(int *x)
{
    *x = *x + 5;
    printf("%d\n", *x);
}

int main()
{
    int num = 10;
    test(&num);
    printf("%d\n", num);
    return 0;
}
```

## 20.3 Trace Question 3

What is the output?

```c
#include <stdio.h>
#define SIZE 3

void change(int arr[])
{
    arr[0] = 100;
}

int main()
{
    int values[SIZE] = {1, 2, 3};
    int i;

    change(values);

    for(i = 0; i < SIZE; i++)
    {
        printf("%d ", values[i]);
    }

    return 0;
}
```

## 20.4 Trace Question 4

What is the output?

```c
#include <stdio.h>
#define ROW 2
#define COL 2

int sum(int arr[][COL])
{
    int i, j;
    int total = 0;

    for(i = 0; i < ROW; i++)
    {
        for(j = 0; j < COL; j++)
        {
            total = total + arr[i][j];
        }
    }

    return total;
}

int main()
{
    int values[ROW][COL] = {
        {1, 2},
        {3, 4}
    };

    printf("%d", sum(values));

    return 0;
}
```

## 20.5 Trace Question 5

What is the output?

```c
#include <stdio.h>

void update(int *p)
{
    (*p)++;
    (*p)++;
}

int main()
{
    int x = 3;
    update(&x);
    printf("%d", x);
    return 0;
}
```

## 20.6 Trace Question 6

What is the output?

```c
#include <stdio.h>
#define SIZE 4

int total(int *arr)
{
    int i;
    int sum = 0;

    for(i = 0; i < SIZE; i++)
    {
        sum = sum + *(arr + i);
    }

    return sum;
}

int main()
{
    int nums[SIZE] = {2, 4, 6, 8};
    printf("%d", total(nums));
    return 0;
}
```

---

# 21. Answers for Code Tracing Questions

## 21.1 Answer 1

Output:

```text
15
10
```

Reason:

`x` is a copy of `num`. Changing `x` does not change `num`.

## 21.2 Answer 2

Output:

```text
15
15
```

Reason:

The function receives the address of `num`, so it modifies the original value.

## 21.3 Answer 3

Output:

```text
100 2 3
```

Reason:

Arrays are effectively passed by reference, so changing `arr[0]` changes `values[0]`.

## 21.4 Answer 4

Output:

```text
10
```

Reason:

The function adds:

```text
1 + 2 + 3 + 4 = 10
```

## 21.5 Answer 5

Output:

```text
5
```

Reason:

`x` starts as `3`. The function increments the original variable twice through the pointer.

## 21.6 Answer 6

Output:

```text
20
```

Reason:

`total(nums)` adds:

```text
2 + 4 + 6 + 8 = 20
```

---

# 22. Compact Revision Checklist

- Pass by value gives the function a copy.
- Pass by reference in C is done by passing an address to a pointer parameter.
- `&x` means the address of `x`.
- `*p` means the value at the address stored in `p`.
- `(*p)++` increments the value pointed to by `p`.
- `*p++` does not mean the same thing as `(*p)++`.
- A 1-D array is passed using its name.
- An array name represents the address of the first element.
- A function can modify the original array.
- A function does not automatically know the size of a 1-D array.
- Passing the array size separately is usually better.
- A 2-D array parameter must include the number of columns.
- `int arr[][]` is invalid as a 2-D array parameter.
- 2-D arrays normally require nested loops.
- Use `< SIZE`, not `<= SIZE`, when looping through an array.
- Initialise totals before adding into them.

---

# 23. Final Summary

Pass by value gives a function a copy of a variable, so changing the parameter does not change the original variable.

Pass by reference in C is achieved by passing the address of a variable to a pointer parameter. The function can then use dereferencing to access and modify the original variable.

A 1-D array is passed to a function using the array name. The array name represents the address of the first element, so the function can access the original array. This means changes made to the array inside the function affect the original array.

A 2-D array is also passed using the array name, but the function parameter must include the number of columns. C needs the column count to calculate where each element is stored in memory.

The main mistakes to avoid are forgetting `&`, forgetting `*`, confusing `*p++` with `(*p)++`, passing an array element instead of the whole array, omitting the column size in 2-D array parameters, using the wrong loop bounds, and forgetting to initialise totals.
