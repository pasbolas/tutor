# HDLC Notes - Step 2
# HDLC Frame Types

# Introduction

HDLC uses three different types of frames.

Each frame type performs a different function during communication.

| Frame Type | Full Name | Purpose |
|---|---|---|
| I-frame | Information frame | Carries user data |
| S-frame | Supervisory frame | Flow and error control |
| U-frame | Unnumbered frame | Link management |

---

# 1. Information Frames (I-Frames)

I-frames are used to carry:

- user data
- sequence numbers
- acknowledgements

Their main purpose is:

> Data transfer

---

# I-Frame Control Field

The control field of an I-frame contains:

```text
0 | N(S) | P/F | N(R)
```

---

# Meaning of Fields

| Field | Purpose |
|---|---|
| 0 | Identifies the frame as an I-frame |
| N(S) | Send sequence number |
| P/F | Poll/Final bit |
| N(R) | Receive sequence number |

---

# Sequence Numbers

## N(S)

N(S) identifies:

> the current frame being transmitted

Example:

```text
N(S) = 3
```

means:

> "This is frame number 3."

---

## N(R)

N(R) identifies:

> the next frame expected

Example:

```text
N(R) = 5
```

means:

> "I have correctly received frames up to 4 and now expect frame 5."

---

# Piggybacking

HDLC uses a technique called:

# Piggybacking

This means:

- data and acknowledgements are sent together in the same frame

Instead of sending a separate acknowledgement frame, the ACK information is included inside the outgoing I-frame.

This improves efficiency.

---

# Example of Piggybacking

Suppose station A sends:

```text
I,0,0
```

This means:

| Part | Meaning |
|---|---|
| I | Information frame |
| 0 | Current transmitted frame number |
| 0 | Expecting frame 0 from other station |

---

Station B replies:

```text
I,0,1
```

This means:

| Part | Meaning |
|---|---|
| I | Information frame |
| 0 | Current transmitted frame number |
| 1 | Frame 0 received successfully, expecting frame 1 next |

---

# Important Point

## N(S)

Represents:

> current outgoing frame

## N(R)

Represents:

> acknowledgement / next expected frame

---

# 2. Supervisory Frames (S-Frames)

S-frames are used for:

- flow control
- error control

They do not carry user data.

---

# S-Frame Control Field

```text
10 | S | P/F | N(R)
```

---

# Types of S-Frames

| S-Frame | Full Name | Purpose |
|---|---|---|
| RR | Receive Ready | Receiver ready to continue |
| RNR | Receive Not Ready | Receiver temporarily busy |
| REJ | Reject | Retransmit from error onward |
| SREJ | Selective Reject | Retransmit only missing frame |

---

# RR - Receive Ready

Indicates:

> "Everything received correctly. Continue sending."

This acts as a positive acknowledgement.

---

# RNR - Receive Not Ready

Indicates:

> "Temporarily stop transmission."

The receiver may be busy or overloaded.

---

# REJ - Reject

Used in:

> Go-Back-N ARQ

Indicates:

> "Resend frames starting from the missing or damaged frame."

---

# SREJ - Selective Reject

Used in:

> Selective Reject ARQ

Indicates:

> "Resend only the specific missing frame."

---

# 3. Unnumbered Frames (U-Frames)

U-frames are used for:

- link setup
- disconnection
- link management

---

# U-Frame Control Field

```text
11 | M | P/F | M
```

---

# Common U-Frames

| U-Frame | Purpose |
|---|---|
| SABM | Set Asynchronous Balanced Mode |
| DISC | Disconnect |
| UA | Unnumbered Acknowledgement |
| DM | Disconnect Mode |

---

# SABM

SABM is used to:

> establish communication between stations

Full form:

> Set Asynchronous Balanced Mode

---

# UA

UA means:

> Unnumbered Acknowledgement

It is used to accept:

- setup requests
- disconnect requests

---

# DISC

DISC is used to:

> terminate communication

---

# DM

DM means:

> Disconnect Mode

It is used to reject a connection request.

---

# Example Connection Setup

## Step 1

Station A sends:

```text
SABM
```

---

## Step 2

Station B replies:

```text
UA
```

Communication link is established.

---

# Example Disconnect

## Step 1

Station A sends:

```text
DISC
```

---

## Step 2

Station B replies:

```text
UA
```

Communication is terminated.

---

# Important Memory Table

| Frame Type | Main Function |
|---|---|
| I-frame | Carries data |
| S-frame | Flow and error control |
| U-frame | Link management |

---

# Important Exam Question

## Q: Describe the three HDLC frame types.

## A:

### Information Frames (I-Frames)
Carry user data and piggybacked acknowledgements.

### Supervisory Frames (S-Frames)
Provide flow control and error control.

### Unnumbered Frames (U-Frames)
Perform link management functions such as setup and disconnect.

---

# Another Important Question

## Q: What is piggybacking?

## A:

Piggybacking is a technique in which acknowledgement information is included within outgoing data frames instead of sending separate acknowledgement frames.

---

# Key Points to Remember

## I-Frames
- carry user data
- contain sequence numbers
- support piggybacking

---

## S-Frames
- used for flow control
- used for error control
- do not carry user data

---

## U-Frames
- establish links
- disconnect links
- manage communication

---

# Quick Revision Table

| Term | Meaning |
|---|---|
| N(S) | Current transmitted frame number |
| N(R) | Next expected frame number |
| RR | Receive Ready |
| RNR | Receive Not Ready |
| REJ | Reject |
| SREJ | Selective Reject |
| SABM | Setup communication |
| DISC | Disconnect communication |
| UA | Acknowledgement |

---

# Next Topic

HDLC operation phases and sequence number operation.
