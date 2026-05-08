# C Programming Notes: Structures

## 1. What is a structure?

A **structure** in C is a user-defined data type that allows different types of data to be grouped together under one name.

Arrays are useful when all values are of the same type. For example, an `int` array can store several integers, and a `char` array can store characters. However, many real records contain mixed data.

Example student record:

- student ID: `int`
- first name: `char[]`
- surname: `char[]`
- results: `int[]`
- date of birth: another structure

A structure is suitable here because the record contains more than one data type.

```c
struct student_rec
{
    int student_ID;
    char firstname[11];
    char surname[21];
    int results[5];
};
```

This creates a **structure template**, not a variable. The template describes what a student record should contain. Humanity somehow needed a separate keyword for “shape of data”, and here we are.

---

## 2. Structure template, tag, and members

```c
struct student_rec
{
    int student_ID;
    char firstname[11];
    char surname[21];
    int results[5];
};
```

### Structure tag

The name after `struct` is the **structure tag**.

```c
student_rec
```

When declaring variables later, the full type name is:

```c
struct student_rec
```

### Structure members

The variables inside the braces are called **members**.

```c
int student_ID;
char firstname[11];
char surname[21];
int results[5];
```

Each structure variable created from this template gets its own copy of these members.

---

## 3. Declaring structure variables

A structure template does not create storage by itself. It only defines the layout.

To actually create variables:

```c
struct student_rec student1, student2;
```

Now `student1` and `student2` are two separate structure variables. Each has its own:

- `student_ID`
- `firstname`
- `surname`
- `results`

Changing `student1.student_ID` does not change `student2.student_ID`.

---

## 4. Accessing structure members using the dot operator

To access a member of a structure variable, use the dot operator:

```c
structure_variable.member_name
```

Example:

```c
student1.student_ID = 1234;
```

This assigns `1234` to the `student_ID` member of `student1`.

To print it:

```c
printf("%d", student1.student_ID);
```

The dot operator is used when working directly with a structure variable.

---

## 5. Assigning strings inside structures

Character array members cannot be assigned using `=` after declaration.

Wrong:

```c
student1.firstname = "Sarah";
```

Correct:

```c
strcpy(student1.firstname, "Sarah");
```

Because `firstname` is a character array, `strcpy()` is used to copy the string into the array.

Required header:

```c
#include <string.h>
```

Example:

```c
#include <stdio.h>
#include <string.h>

struct student_rec
{
    int student_ID;
    char firstname[11];
    char surname[21];
    int results[5];
};

int main(void)
{
    struct student_rec student1;

    student1.student_ID = 1234;
    strcpy(student1.firstname, "Sarah");
    strcpy(student1.surname, "Jones");

    return 0;
}
```

---

## 6. Assigning array members inside a structure

If a structure contains an array, each array element must be assigned separately unless the structure is being initialised at declaration.

Example:

```c
student1.results[0] = 100;
student1.results[1] = 89;
student1.results[2] = 56;
student1.results[3] = 95;
student1.results[4] = 91;
```

Or use a loop when entering values:

```c
int i;

for (i = 0; i < 5; i++)
{
    scanf("%d", &student1.results[i]);
}
```

Notice the access pattern:

```c
student1.results[i]
```

This means:

1. go to `student1`
2. access its `results` member
3. access element `i` of that array

---

## 7. Initialising a structure

A structure can be initialised at the time it is declared.

```c
struct student_rec student = {
    1234,
    "Joe",
    "Murphy",
    {54, 63, 77, 90, 51}
};
```

This assigns values in the same order as the members appear in the structure template.

Given this template:

```c
struct student_rec
{
    int student_ID;
    char firstname[11];
    char surname[21];
    int results[5];
};
```

The initialisation matches like this:

| Initial value | Structure member |
|---|---|
| `1234` | `student_ID` |
| `"Joe"` | `firstname` |
| `"Murphy"` | `surname` |
| `{54, 63, 77, 90, 51}` | `results` |

### Important point

Initialisation is not the same as later assignment.

Allowed during declaration:

```c
struct student_rec student = {1234, "Joe", "Murphy", {54, 63, 77, 90, 51}};
```

Not allowed later as a simple string assignment:

```c
student.firstname = "Joe";   // wrong
```

Use:

```c
strcpy(student.firstname, "Joe");
```

---

## 8. Pointers to structures

A pointer to a structure stores the address of a structure variable.

General format:

```c
struct tag_name *pointer_name;
```

Example:

```c
struct student_rec *ptr;
```

If there is a structure variable:

```c
struct student_rec student;
```

The pointer can point to it using the address operator `&`:

```c
ptr = &student;
```

Now `ptr` stores the address of `student`.

---

## 9. Accessing structure members through a pointer

If you have a normal structure variable, use the dot operator:

```c
student.student_ID
```

If you have a pointer to a structure, there are two ways to access members.

### Method 1: dereference then dot

```c
(*ptr).student_ID
```

The brackets are important because the dot operator has higher precedence than `*`.

Without brackets:

```c
*ptr.student_ID   // wrong
```

C would try to access `student_ID` from `ptr` first, which is not what is intended.

### Method 2: arrow operator

```c
ptr->student_ID
```

This is the cleaner and more common way.

These two lines mean the same thing:

```c
(*ptr).student_ID
ptr->student_ID
```

The arrow operator is used when working through a pointer to a structure.

---

## 10. Full example: pointer to a structure

```c
#include <stdio.h>
#define SIZE 5

struct student_rec
{
    int student_ID;
    char firstname[11];
    char surname[21];
    int results[5];
};

int main(void)
{
    int i;

    struct student_rec student = {
        1234,
        "Joe",
        "Murphy",
        {54, 63, 77, 90, 51}
    };

    struct student_rec *ptr;

    ptr = &student;

    printf("ID is: %d\n", student.student_ID);
    printf("ID is: %d\n", (*ptr).student_ID);
    printf("ID is: %d\n", ptr->student_ID);

    printf("Firstname: %s\n", ptr->firstname);
    printf("Surname: %s\n", ptr->surname);

    printf("Results are:\n");
    for (i = 0; i < SIZE; i++)
    {
        printf("%d\n", ptr->results[i]);
    }

    return 0;
}
```

### Key idea

Once `ptr = &student;` is done, the pointer can access the same data stored inside `student`.

So:

```c
ptr->student_ID
```

accesses the `student_ID` inside the original `student` variable.

---

## 11. Passing structures to functions

Structure variables can be passed to functions in two main ways:

1. pass by value
2. pass by reference

This follows the same general function rules used for normal variables.

---

## 12. Passing a structure by value

Passing by value means a copy of the structure is passed to the function.

Function prototype:

```c
void display(struct student_rec);
```

Function call:

```c
display(student);
```

Function definition:

```c
void display(struct student_rec stu)
{
    printf("%d", stu.student_ID);
}
```

Here, `stu` is a copy of `student`.

### What this means

If the function only displays or reads data, pass by value works.

If the function changes `stu`, the original `student` in `main()` will not be changed.

Example:

```c
void changeID(struct student_rec stu)
{
    stu.student_ID = 9999;
}
```

If called like this:

```c
changeID(student);
```

The original `student.student_ID` is unchanged.

C loves making copies unless you very clearly threaten it with a pointer.

---

## 13. Example: displaying a structure using pass by value

```c
#include <stdio.h>
#define SIZE 5

struct student_rec
{
    int student_ID;
    char firstname[11];
    char surname[21];
    int results[5];
};

void display(struct student_rec);

int main(void)
{
    struct student_rec student = {
        1234,
        "Joe",
        "Murphy",
        {54, 63, 77, 90, 51}
    };

    display(student);

    return 0;
}

void display(struct student_rec stu)
{
    int i;

    printf("Student Record\n");
    printf("ID is: %d\n", stu.student_ID);
    printf("Firstname: %s\n", stu.firstname);
    printf("Surname: %s\n", stu.surname);

    printf("Results are:\n");
    for (i = 0; i < SIZE; i++)
    {
        printf("%d\n", stu.results[i]);
    }
}
```

### Why pass by value is fine here

The function only prints the values. It does not need to change the original structure.

---

## 14. Passing a structure by reference

Passing by reference means passing the address of the structure.

This is done using a pointer parameter.

Function prototype:

```c
void enter(struct student_rec *);
```

Function call:

```c
enter(&student);
```

Function definition:

```c
void enter(struct student_rec *ptr)
{
    scanf("%d", &ptr->student_ID);
}
```

### Why use pass by reference?

Use pass by reference when the function needs to change the original structure.

For example, an input function that fills a structure must change the original variable in `main()`.

```c
enter(&student);
```

This sends the address of `student` to the function.

Inside the function, `ptr` points to the original structure.

---

## 15. Example: entering structure data using pass by reference

```c
#include <stdio.h>
#define SIZE 5

struct student_rec
{
    int student_ID;
    char firstname[21];
    char surname[21];
    int results[5];
};

void enter(struct student_rec *);
void display(struct student_rec);

int main(void)
{
    struct student_rec student;

    enter(&student);
    display(student);

    return 0;
}

void enter(struct student_rec *ptr)
{
    int i;

    printf("Enter student ID: ");
    scanf("%d", &ptr->student_ID);

    while (getchar() != '\n');

    printf("Enter first name: ");
    fgets(ptr->firstname, 21, stdin);

    printf("Enter surname: ");
    fgets(ptr->surname, 21, stdin);

    printf("Enter %d results\n", SIZE);
    for (i = 0; i < SIZE; i++)
    {
        scanf("%d", &ptr->results[i]);
    }
}

void display(struct student_rec stu)
{
    int i;

    printf("Student Record\n");
    printf("ID is: %d\n", stu.student_ID);
    printf("Firstname: %s", stu.firstname);
    printf("Surname: %s", stu.surname);

    printf("Results are:\n");
    for (i = 0; i < SIZE; i++)
    {
        printf("%d\n", stu.results[i]);
    }
}
```

### Why `enter()` uses pass by reference

`enter()` must store data into the original `student` variable created in `main()`.

If `enter()` received a copy instead, the entered data would only exist inside the function copy and would disappear after the function ended.

### Why `display()` can use pass by value

`display()` only reads and prints the structure. It does not need to modify the original.

---

## 16. `scanf()` with pointer-to-structure members

This line appears slightly cursed, so break it down:

```c
scanf("%d", &ptr->student_ID);
```

`ptr->student_ID` means:

```c
student.student_ID
```

because `ptr` points to `student`.

`scanf()` needs the address of the place where the input should be stored.

So we use:

```c
&ptr->student_ID
```

This gives the address of the `student_ID` member inside the structure.

### For character arrays

For `fgets()`:

```c
fgets(ptr->firstname, 21, stdin);
```

No `&` is needed because `firstname` is already an array, and the array name acts like the address of its first element.

Same kind of tiny C detail that ruins afternoons.

---

## 17. Clearing the input buffer

After using `scanf()` to read a number, the newline character from pressing Enter can remain in the input buffer.

If `fgets()` is used immediately after `scanf()`, it may read that leftover newline instead of waiting for real input.

Example:

```c
scanf("%d", &ptr->student_ID);
while (getchar() != '\n');
fgets(ptr->firstname, 21, stdin);
```

The loop:

```c
while (getchar() != '\n');
```

removes remaining characters until the newline is reached.

### Common situation

This problem often happens when mixing:

```c
scanf()
```

with:

```c
fgets()
```

---

## 18. Nested structures

A nested structure is a structure inside another structure.

Example:

```c
struct date
{
    int day;
    int month;
    int year;
};

struct student_rec
{
    int student_ID;
    char firstname[11];
    char surname[21];
    int results[5];
    struct date DOB;
};
```

Here, `DOB` is a member of `student_rec`, but its type is another structure:

```c
struct date
```

This is useful when a member is itself made of smaller related parts.

A date contains:

- day
- month
- year

So instead of storing them as three unrelated integers directly inside `student_rec`, they are grouped together as a `date` structure.

---

## 19. Accessing nested structure members

If you have:

```c
struct student_rec stu;
```

and `stu` contains:

```c
struct date DOB;
```

Then access nested members using multiple dot operators:

```c
stu.DOB.day
stu.DOB.month
stu.DOB.year
```

Example:

```c
scanf("%d", &stu.DOB.day);
scanf("%d", &stu.DOB.month);
scanf("%d", &stu.DOB.year);
```

To print:

```c
printf("Day: %d", stu.DOB.day);
printf("Month: %d", stu.DOB.month);
printf("Year: %d", stu.DOB.year);
```

### Reading nested access

```c
stu.DOB.day
```

means:

1. go to structure variable `stu`
2. access its `DOB` member
3. access the `day` member inside `DOB`

---

## 20. Nested structure example

```c
#include <stdio.h>
#define LENGTH 11
#define S_LENGTH 21
#define SIZE 5

struct date
{
    int day;
    int month;
    int year;
};

struct student_rec
{
    int student_ID;
    char firstname[LENGTH];
    char surname[S_LENGTH];
    int results[SIZE];
    struct date DOB;
};

int main(void)
{
    int i;
    struct student_rec stu;

    printf("Enter ID:\n");
    scanf("%d", &stu.student_ID);

    while (getchar() != '\n');

    printf("Enter first name:\n");
    fgets(stu.firstname, LENGTH, stdin);

    printf("Enter surname:\n");
    fgets(stu.surname, S_LENGTH, stdin);

    printf("Enter %d results:\n", SIZE);
    for (i = 0; i < SIZE; i++)
    {
        scanf("%d", &stu.results[i]);
    }

    printf("Enter date of birth in order: day month year\n");
    scanf("%d", &stu.DOB.day);
    scanf("%d", &stu.DOB.month);
    scanf("%d", &stu.DOB.year);

    printf("Student record is:\n");
    printf("ID: %d\n", stu.student_ID);
    printf("First name: %s", stu.firstname);
    printf("Surname: %s", stu.surname);

    printf("Results are: ");
    for (i = 0; i < SIZE; i++)
    {
        printf("%d ", stu.results[i]);
    }

    printf("\nDate of Birth:\n");
    printf("Day: %d\n", stu.DOB.day);
    printf("Month: %d\n", stu.DOB.month);
    printf("Year: %d\n", stu.DOB.year);

    return 0;
}
```

---

## 21. Arrays of structures

An array of structures stores several structure variables of the same type.

Example:

```c
struct student_rec students[5];
```

This creates an array called `students` with 5 elements.

Each element is a full `struct student_rec` variable.

So:

```c
students[0]
```

is one complete student record.

```c
students[1]
```

is another complete student record.

Each one has its own:

- `student_ID`
- `firstname`
- `surname`
- `results`
- `DOB`

---

## 22. Accessing members in an array of structures

Use the array index first, then the dot operator.

```c
students[i].student_ID
```

This means:

1. go to element `i` in the `students` array
2. access the `student_ID` member of that structure

Examples:

```c
scanf("%d", &students[i].student_ID);
fgets(students[i].firstname, LENGTH, stdin);
printf("%s", students[i].firstname);
```

For an array member inside a structure array:

```c
students[i].results[j]
```

This means:

1. go to student `i`
2. access their `results` array
3. access result `j`

For a nested structure inside an array of structures:

```c
students[i].DOB.day
```

This means:

1. go to student `i`
2. access their `DOB`
3. access the `day` inside that `DOB`

---

## 23. Example: entering IDs into an array of structures

```c
#include <stdio.h>
#define SIZE 5
#define LENGTH 11
#define S_LENGTH 21

struct date
{
    int day;
    int month;
    int year;
};

struct student_rec
{
    int student_ID;
    char firstname[LENGTH];
    char surname[S_LENGTH];
    int results[SIZE];
    struct date DOB;
};

int main(void)
{
    int i;
    struct student_rec students[SIZE];

    printf("Enter ID for each student:\n");

    for (i = 0; i < SIZE; i++)
    {
        printf("Enter ID for student %d: ", i + 1);
        scanf("%d", &students[i].student_ID);
    }

    printf("The Student ID for each student is:\n");

    for (i = 0; i < SIZE; i++)
    {
        printf("%d ", students[i].student_ID);
    }

    return 0;
}
```

---

## 24. Example: entering names into an array of structures

```c
while (getchar() != '\n');

for (i = 0; i < SIZE; i++)
{
    printf("Enter first name for student %d: ", i + 1);
    fgets(students[i].firstname, LENGTH, stdin);
}
```

The buffer clear is needed because `scanf()` leaves a newline behind before `fgets()` is used.

---

## 25. Arrays of structures with nested structures

If each student has a nested date of birth, the code can access it like this:

```c
for (i = 0; i < SIZE; i++)
{
    printf("Enter DOB for student %d\n", i + 1);
    scanf("%d", &students[i].DOB.day);
    scanf("%d", &students[i].DOB.month);
    scanf("%d", &students[i].DOB.year);
}
```

To print:

```c
for (i = 0; i < SIZE; i++)
{
    printf("DOB: %d/%d/%d\n",
           students[i].DOB.day,
           students[i].DOB.month,
           students[i].DOB.year);
}
```

This is where structures become genuinely useful, despite the syntax trying its best to look like plumbing.

---

## 26. `typedef`

`typedef` allows a programmer to create another name for an existing data type.

General idea:

```c
typedef existing_type new_name;
```

Example:

```c
typedef char STRING;
```

Now `STRING` can be used as another name for `char`.

```c
STRING letter;
```

This is equivalent to:

```c
char letter;
```

For a character array:

```c
STRING sentence[11] = "Hello";
```

This means:

```c
char sentence[11] = "Hello";
```

---

## 27. `typedef` with pointers

Example:

```c
typedef int* INT_POINTER;
```

Now:

```c
INT_POINTER ptr2;
```

means:

```c
int *ptr2;
```

### Be careful

Pointer typedefs can make code harder to read if overused.

Example:

```c
INT_POINTER a, b;
```

Both `a` and `b` are pointer variables because `INT_POINTER` already includes `*`.

That is different from:

```c
int *a, b;
```

Here only `a` is a pointer, while `b` is a normal integer.

This is one of those C traps that exists because apparently suffering builds character.

---

## 28. `typedef` with structures

A common use of `typedef` is to make structure declarations shorter.

Without `typedef`:

```c
struct student_rec student1;
```

With `typedef`:

```c
typedef struct student_rec Student;

Student student1;
```

Another style:

```c
typedef struct
{
    int student_ID;
    char firstname[11];
    char surname[21];
    int results[5];
} Student;
```

Then variables can be created like this:

```c
Student student1, student2;
```

### Important point

Your provided notes mainly show `typedef` as a synonym for existing types such as `char` and pointer types. The same idea can also be applied to structures.

---

## 29. Creating structure variables directly from an unnamed template

It is possible to create structure variables directly when defining a structure:

```c
struct
{
    int student_ID;
    char firstname[11];
    char surname[21];
    int results[5];
} stu, stu2, stu3;
```

This creates variables immediately.

However, there is no structure tag name, so it is less reusable.

### If declared globally

If this is written outside all functions, the structure template and variables are global.

### If declared locally

If this is written inside a function, the structure template and variables are local to that function.

That means other functions cannot create their own variables using that unnamed template.

This style is usually less flexible than giving the structure a named tag.

---

## 30. Comparing structures

Two structure variables cannot be compared directly using `==`.

Wrong:

```c
if (stu1 == stu2)
{
    printf("Same");
}
```

Even if both structures come from the same template, C does not allow full structure comparison with `==`.

Instead, compare members individually.

Example:

```c
if (stu1.student_ID == stu2.student_ID)
{
    printf("Same ID");
}
```

For strings, use `strcmp()`:

```c
if (strcmp(stu1.firstname, stu2.firstname) == 0)
{
    printf("Same first name");
}
```

For arrays inside structures, compare each array element using a loop.

Example:

```c
int same = 1;
int i;

for (i = 0; i < SIZE; i++)
{
    if (stu1.results[i] != stu2.results[i])
    {
        same = 0;
    }
}
```

---

## 31. Dot operator vs arrow operator

| Situation | Operator | Example |
|---|---|---|
| Normal structure variable | `.` | `student.student_ID` |
| Pointer to structure | `->` | `ptr->student_ID` |
| Pointer with dereference | `(*ptr).` | `(*ptr).student_ID` |

### Same meaning

```c
ptr->student_ID
```

is the same as:

```c
(*ptr).student_ID
```

### Arrow syntax warning

There must be no space inside the arrow operator.

Correct:

```c
ptr->student_ID
```

Wrong:

```c
ptr - > student_ID
```

The arrow is one operator, not a hyphen having an identity crisis.

---

## 32. Useful things to remember

- A structure groups related data items of different types.
- A structure template does not create a variable by itself.
- Use `struct tag_name variable_name;` to create a structure variable.
- Use the dot operator `.` with normal structure variables.
- Use the arrow operator `->` with pointers to structures.
- Character arrays inside structures need `strcpy()` for assignment after declaration.
- Arrays inside structures are accessed using both the member name and an index.
- Nested structures allow one structure to contain another structure.
- Arrays of structures allow multiple records to be stored together.
- Passing a structure by value sends a copy.
- Passing a structure by reference sends the address.
- Use pass by reference when a function needs to modify the original structure.
- Use pass by value when the function only needs to read or display the structure.
- `typedef` creates another name for an existing type.
- Structures cannot be compared directly using `==`.
- Compare structure members individually.
- Use `strcmp()` to compare string members.
- Clear the input buffer when switching from `scanf()` to `fgets()`.

---

## 33. Common mistakes

### Mistake 1: thinking a structure template creates a variable

Wrong idea:

```c
struct student_rec
{
    int student_ID;
};

student_ID = 1234;   // wrong
```

You must create a variable first:

```c
struct student_rec stu;
stu.student_ID = 1234;
```

---

### Mistake 2: forgetting `struct` when declaring a variable

Wrong:

```c
student_rec stu;
```

Correct:

```c
struct student_rec stu;
```

Unless `typedef` has been used.

---

### Mistake 3: assigning strings with `=`

Wrong:

```c
stu.firstname = "Joe";
```

Correct:

```c
strcpy(stu.firstname, "Joe");
```

---

### Mistake 4: using the wrong operator with pointers

Wrong:

```c
ptr.student_ID
```

Correct:

```c
ptr->student_ID
```

or:

```c
(*ptr).student_ID
```

---

### Mistake 5: forgetting brackets around `*ptr`

Wrong:

```c
*ptr.student_ID
```

Correct:

```c
(*ptr).student_ID
```

Even better:

```c
ptr->student_ID
```

---

### Mistake 6: passing a structure by value when the function needs to change it

Wrong for input/modification:

```c
void enter(struct student_rec stu)
{
    scanf("%d", &stu.student_ID);
}
```

This only changes the copy.

Correct:

```c
void enter(struct student_rec *ptr)
{
    scanf("%d", &ptr->student_ID);
}
```

Called using:

```c
enter(&student);
```

---

### Mistake 7: comparing structures directly

Wrong:

```c
if (stu1 == stu2)
```

Correct:

```c
if (stu1.student_ID == stu2.student_ID)
```

For full comparison, compare each member separately.

---

### Mistake 8: using `scanf()` badly with strings

This can overflow if the input is too long:

```c
scanf("%s", stu.firstname);
```

Safer:

```c
fgets(stu.firstname, 11, stdin);
```

But remember that `fgets()` may store the newline character.

---

### Mistake 9: forgetting to clear the buffer before `fgets()`

Problem pattern:

```c
scanf("%d", &stu.student_ID);
fgets(stu.firstname, 11, stdin);
```

Better:

```c
scanf("%d", &stu.student_ID);
while (getchar() != '\n');
fgets(stu.firstname, 11, stdin);
```

---

### Mistake 10: putting spaces inside `->`

Wrong:

```c
ptr - > student_ID
```

Correct:

```c
ptr->student_ID
```

---

## 34. Theory questions

1. What is a structure in C?
2. Why can a structure store data that an array cannot easily store?
3. What is the difference between a structure template and a structure variable?
4. What are structure members?
5. What is the purpose of the dot operator?
6. Why can a character array member not be assigned using `=` after declaration?
7. What function is normally used to copy a string into a character array member?
8. What is structure initialisation?
9. Why must initialisation values match the order of members in the structure template?
10. What is a pointer to a structure?
11. What does the arrow operator do?
12. What is the relationship between `ptr->member` and `(*ptr).member`?
13. Why are brackets needed in `(*ptr).member`?
14. What is the difference between passing a structure by value and passing it by reference?
15. When should a structure be passed by value?
16. When should a structure be passed by reference?
17. Why does an input function for a structure usually use pass by reference?
18. What is a nested structure?
19. How do you access a member inside a nested structure?
20. What is an array of structures?
21. How is `students[i].student_ID` interpreted?
22. How is `students[i].DOB.year` interpreted?
23. What is the purpose of `typedef`?
24. What does `typedef char STRING;` mean?
25. What is a possible disadvantage of hiding pointer types with `typedef`?
26. Why can two structures not be compared directly using `==`?
27. How should string members inside structures be compared?
28. Why can mixing `scanf()` and `fgets()` cause input problems?
29. What does `while (getchar() != '\n');` do?
30. Why is an unnamed structure template less reusable than a named structure template?

---

## 35. Coding questions

### Basic structure practice

1. Create a structure called `book` with the following members:
   - `book_ID`
   - `title`
   - `author`
   - `price`

2. Declare one `book` variable and assign values to all its members.

3. Write code to print all members of a `book` variable.

4. Create a structure called `employee` with:
   - employee number
   - first name
   - surname
   - salary

5. Input values into an `employee` variable using `scanf()` and `fgets()`.

### Structure initialisation

6. Initialise a `book` structure at declaration with sample values.

7. Initialise a `student_rec` variable with:
   - ID `2001`
   - first name `Ali`
   - surname `Khan`
   - results `{70, 80, 65, 90, 77}`

8. Print the initialised student record.

### Pointers to structures

9. Create a pointer to a `student_rec` variable and use it to print the student ID.

10. Rewrite the following using arrow notation:

```c
(*ptr).student_ID
```

11. Rewrite the following using dereference and dot notation:

```c
ptr->surname
```

12. Write a program that creates a structure variable, creates a pointer to it, and updates one member using the pointer.

### Passing structures to functions

13. Write a function called `displayStudent()` that receives a `struct student_rec` by value and prints all its members.

14. Write a function called `enterStudent()` that receives a pointer to a `struct student_rec` and fills it with user input.

15. Write a function called `changeID()` that changes the student ID using pass by reference.

16. Write a function called `averageResult()` that receives a `struct student_rec` by value and returns the average of the results array.

17. Write a program that uses both `enterStudent()` and `displayStudent()`.

### Nested structures

18. Create a structure called `date` with:
   - day
   - month
   - year

19. Add a `struct date DOB;` member to a student structure.

20. Input a student's date of birth using nested dot notation.

21. Print a student's date of birth in this format:

```text
DD/MM/YYYY
```

22. Write a function that receives a student structure and prints only the date of birth.

### Arrays of structures

23. Create an array of 5 student records.

24. Use a loop to enter the student ID for each student.

25. Use a loop to enter the first name for each student.

26. Use nested loops to enter 5 results for each student.

27. Print all student records stored in the array.

28. Write a function that receives an array of structures and prints all student IDs.

29. Write a function that receives an array of structures and finds the student with the highest first result.

30. Write a function that receives an array of structures and calculates the class average for result number 1.

### Comparison and validation

31. Write code to compare whether two students have the same student ID.

32. Write code to compare whether two students have the same first name.

33. Write code to compare whether two students have exactly the same 5 results.

34. Write a function that checks whether a date is valid enough using simple rules:
   - day between 1 and 31
   - month between 1 and 12
   - year greater than 1900

35. Write a function that searches an array of student structures for a specific student ID.

---

## 36. Code tracing questions

### Question 1

What is printed?

```c
struct student_rec
{
    int student_ID;
};

int main(void)
{
    struct student_rec stu = {1234};
    struct student_rec *ptr = &stu;

    ptr->student_ID = 9999;

    printf("%d", stu.student_ID);
    return 0;
}
```

---

### Question 2

Does the original structure change?

```c
void change(struct student_rec stu)
{
    stu.student_ID = 5000;
}

int main(void)
{
    struct student_rec s = {1000};
    change(s);
    printf("%d", s.student_ID);
    return 0;
}
```

---

### Question 3

Does the original structure change?

```c
void change(struct student_rec *ptr)
{
    ptr->student_ID = 5000;
}

int main(void)
{
    struct student_rec s = {1000};
    change(&s);
    printf("%d", s.student_ID);
    return 0;
}
```

---

### Question 4

Explain this expression:

```c
students[i].DOB.year
```

---

### Question 5

Why is this wrong?

```c
if (stu1 == stu2)
{
    printf("Same");
}
```

---

## 37. Short exam-style answers

### What is a structure?

A structure is a user-defined data type in C that groups related variables, possibly of different types, under one name.

### Why use a structure instead of an array?

An array stores values of the same type, while a structure can store values of different types as part of one record.

### What is a nested structure?

A nested structure is a structure that contains another structure as one of its members.

### What is an array of structures?

An array of structures is an array where each element is a complete structure variable.

### What is the arrow operator used for?

The arrow operator is used to access a member of a structure through a pointer to that structure.

### Why pass a structure by reference?

A structure is passed by reference when the function needs to modify the original structure variable or avoid copying a large structure.

### Why can structures not be compared using `==`?

C does not support direct comparison of all members of a structure using one `==` operator. Members must be compared individually.

