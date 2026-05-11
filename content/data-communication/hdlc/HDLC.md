# HDLC Notes - Step 1

# What is HDLC?

HDLC stands for:

**High-Level Data Link Control**

It is a **Data Link Layer protocol** used to make communication over a link:

- reliable
- organised
- error-controlled
- synchronized

The purpose of HDLC is to transform a transmission link into a fully functioning, reliable, and effective data communications link.

---

# The Big Picture

When two computers communicate, several problems can occur:

- bits can become corrupted
- frames can arrive too quickly
- frames can be lost
- sender and receiver can lose synchronization

HDLC solves these problems using different mechanisms.

| Problem | HDLC Solution |
|---|---|
| Frame boundaries unclear | Flags |
| Receiver overwhelmed | Flow control |
| Errors or lost frames | Error control |
| Multiple devices on link | Addressing |
| Setting up communication | Link management |

---

# Important Definition

HDLC is a:

> **Bit-oriented synchronous data link control protocol**

This is an important exam definition.

---

# What Does "Bit-Oriented" Mean?

HDLC works with patterns of bits instead of characters.

Special bit patterns are used to identify the beginning and end of frames.

The important pattern is:

```text
01111110
```

This pattern is called the:

# FLAG

The flag is used to mark:

- the start of a frame
- the end of a frame

---

# What is a Frame?

HDLC sends data in blocks called **frames**.

Each frame contains several fields.

| Field | Purpose |
|---|---|
| Flag | Marks start and end |
| Address | Identifies destination |
| Control | Flow and error control |
| Information | Actual user data |
| FCS | Error detection |

The HDLC frame format is:

```text
Flag | Address | Control | Information | FCS | Flag
```

---

# Core Concept

Every HDLC frame begins and ends with the flag pattern:

```text
01111110
```

This allows the receiver to detect frame boundaries.

---

# Common Exam Question

## Q: What is the HDLC flag pattern?

## A:

```text
01111110
```

It is used to identify the beginning and end of a frame.

---

# Problem: What if the Flag Appears Inside Data?

Suppose the actual data contains:

```text
01111110
```

The receiver may incorrectly think the frame has ended.

To prevent this, HDLC uses:

# Bit Stuffing

---

# Bit Stuffing Rule

Whenever the sender detects:

```text
11111
```

it automatically inserts:

```text
0
```

So:

```text
11111
```

becomes:

```text
111110
```

This prevents accidental creation of the flag pattern.

---

# Example of Bit Stuffing

Original data:

```text
111111
```

After bit stuffing:

```text
1111101
```

After the first five consecutive 1s, a 0 is inserted.

---

# Receiver Side

The receiver automatically removes stuffed 0 bits during reception.

This process is called:

> **Destuffing**

---

# Common Exam Question

## Q: Why is bit stuffing used in HDLC?

## A:

Bit stuffing is used to prevent the HDLC flag sequence from appearing inside the frame data. After every sequence of five consecutive 1s, the sender inserts a 0 bit. The receiver removes the extra 0 during reception.

---

# Summary

## HDLC Characteristics

- Data link layer protocol
- Reliable communication
- Synchronous communication
- Bit-oriented protocol

---

## HDLC Frame Format

```text
Flag | Address | Control | Information | FCS | Flag
```

---

## HDLC Flag Pattern

```text
01111110
```

---

## Bit Stuffing Rule

After five consecutive 1s:

```text
Insert 0
```

---

# Mini Test

## Question

Apply bit stuffing to:

```text
111110111111
```

## Answer

After every sequence of five 1s, insert a 0.

Result:

```text
11111001111101
```

---

# Next Topic

The three HDLC frame types:

- I-frames
- S-frames
- U-frames
