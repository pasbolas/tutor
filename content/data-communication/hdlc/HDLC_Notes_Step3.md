# HDLC Notes - Step 3
# HDLC Operation and Sequence Numbers

# Introduction

HDLC communication occurs in three major phases.

| Phase | Purpose |
|---|---|
| Phase 1 | Initialisation |
| Phase 2 | Data Transfer |
| Phase 3 | Disconnect |

These phases control how stations establish communication, exchange data, and terminate the link.

---

# Phase 1 - Initialisation

Before data transfer begins, the communication link must be established.

This process is called:

# Initialisation

---

# Purpose of Initialisation

During this phase:

- stations agree to communicate
- communication mode is established
- link parameters are prepared

---

# Frames Used

Only:

# U-Frames

are used during initialisation.

---

# Most Common Setup Command

The most common setup command is:

```text
SABM
```

Full form:

> Set Asynchronous Balanced Mode

---

# Balanced Mode

Balanced mode means:

- both stations can send data
- both stations can receive data
- both stations can initiate communication

Both stations operate as equals.

---

# Initialisation Process

## Step 1

Station A sends:

```text
SABM
```

This requests establishment of communication.

---

## Step 2

Station B replies:

```text
UA
```

Full form:

> Unnumbered Acknowledgement

This accepts the request.

Communication is now established.

---

# Rejecting Setup

If the receiving station rejects the request, it sends:

```text
DM
```

Full form:

> Disconnect Mode

This indicates the connection request was rejected.

---

# Important Exam Point

During the initialisation phase:

- only U-frames are used

---

# Phase 2 - Data Transfer

After initialisation, stations exchange actual user data.

This is called:

# Data Transfer Phase

---

# Frames Used

During this phase:

# I-Frames

are primarily used.

---

# Purpose of I-Frames

I-frames carry:

- user data
- sequence numbers
- acknowledgements

---

# Sequence Numbers

Each I-frame contains two sequence numbers:

| Sequence Number | Purpose |
|---|---|
| N(S) | Current transmitted frame number |
| N(R) | Next frame expected |

---

# N(S)

N(S) means:

> "This is the frame I am sending."

Example:

```text
N(S) = 2
```

means:

> "This is frame number 2."

---

# N(R)

N(R) means:

> "This is the next frame I expect from you."

Example:

```text
N(R) = 5
```

means:

> "I have correctly received frames up to 4 and now expect frame 5."

---

# Important Rule

## N(R) acts as an acknowledgement.

---

# Example Communication

## Step 1

Station A sends:

```text
I,0,0
```

Meaning:

| Part | Meaning |
|---|---|
| I | Information frame |
| 0 | Current transmitted frame |
| 0 | Expecting frame 0 from other station |

---

## Step 2

Station B replies:

```text
I,0,1
```

Meaning:

| Part | Meaning |
|---|---|
| I | Information frame |
| 0 | Current transmitted frame |
| 1 | Frame 0 received successfully, expecting frame 1 |

---

## Step 3

Station A sends:

```text
I,1,1
```

Meaning:

| Part | Meaning |
|---|---|
| I | Information frame |
| 1 | Current transmitted frame |
| 1 | Frame 0 from B received successfully |

---

# Piggybacking

HDLC uses:

# Piggybacking

This means:

- acknowledgements are included inside outgoing I-frames

instead of sending separate acknowledgement frames.

This improves efficiency.

---

# Flow Control and Error Control

When piggybacking is not possible, HDLC uses:

# S-Frames

for acknowledgements and control.

---

# Common S-Frames

| S-Frame | Purpose |
|---|---|
| RR | Receive Ready |
| RNR | Receive Not Ready |
| REJ | Reject |
| SREJ | Selective Reject |

---

# RR - Receive Ready

Means:

> "Everything received correctly. Continue transmission."

---

# RNR - Receive Not Ready

Means:

> "Temporarily stop sending."

---

# REJ - Reject

Means:

> "Resend frames starting from the missing or damaged frame."

Used in:

> Go-Back-N ARQ

---

# SREJ - Selective Reject

Means:

> "Resend only the specific missing frame."

Used in:

> Selective Reject ARQ

---

# Error Recovery Example

Suppose frame 4 is lost.

Receiver sends:

```text
REJ,4
```

Meaning:

> "Resend starting from frame 4."

---

# Poll/Final Bit (P/F)

The control field also contains the:

# P/F Bit

| Bit | Meaning |
|---|---|
| P | Poll |
| F | Final |

---

# Poll Bit

Used by a station to request a response.

Meaning:

> "Please reply."

---

# Final Bit

Used in responses.

Meaning:

> "This is my response."

---

# Phase 3 - Disconnect

Either station may terminate communication.

This is called:

# Disconnect Phase

---

# Disconnect Procedure

## Step 1

One station sends:

```text
DISC
```

Meaning:

> Disconnect request

---

## Step 2

Other station replies:

```text
UA
```

Meaning:

> Disconnect acknowledged

Communication link is terminated.

---

# Complete HDLC Communication Flow

## Initialisation

```text
SABM -> UA
```

---

## Data Transfer

```text
I-frames with N(S) and N(R)
```

---

## Flow and Error Control

```text
RR / RNR / REJ / SREJ
```

---

## Disconnect

```text
DISC -> UA
```

---

# Important Exam Question

## Q: Describe the three phases of HDLC operation.

## A:

### 1. Initialisation
The link is established using U-frames such as SABM and UA.

### 2. Data Transfer
Data is exchanged using I-frames. Sequence numbers provide flow and error control.

### 3. Disconnect
The communication link is terminated using DISC and UA frames.

---

# Important Exam Question

## Q: What is the purpose of N(S) and N(R)?

## A:

- N(S) identifies the sequence number of the transmitted frame.
- N(R) identifies the next expected frame and acts as an acknowledgement.

---

# Key Points to Remember

## Initialisation
- Uses U-frames
- SABM establishes connection
- UA acknowledges setup

---

## Data Transfer
- Uses I-frames
- Supports piggybacking
- Uses sequence numbers

---

## Error Control
- Uses S-frames
- RR, RNR, REJ, SREJ

---

## Disconnect
- DISC terminates communication
- UA acknowledges disconnect

---

# Quick Revision Table

| Term | Meaning |
|---|---|
| SABM | Set Asynchronous Balanced Mode |
| UA | Unnumbered Acknowledgement |
| DISC | Disconnect |
| DM | Disconnect Mode |
| N(S) | Current transmitted frame |
| N(R) | Next expected frame |
| RR | Receive Ready |
| REJ | Reject |

---

# Most Important Concept

## N(S)

Represents:

> current outgoing frame

## N(R)

Represents:

> next expected frame / acknowledgement

---

# Next Topic

Detailed HDLC frame format fields and exam-style questions.
