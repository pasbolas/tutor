# Extending LANs with Repeaters and Bridges
# Comprehensive Q/A Style Exam Notes

## Repeaters

### What is a repeater?
A repeater is a Physical Layer device that regenerates weakened signals and retransmits them.

### Why are repeaters used?
Signals weaken over distance due to attenuation. Repeaters extend the physical distance of a LAN.

### What does a repeater work with?
Bits, not frames.

### Does a repeater inspect MAC addresses?
No.

### Does a repeater filter traffic?
No. It forwards everything.

### Does a repeater create separate LANs?
No. All connected devices still belong to the same collision domain and broadcast domain.

---

## Bridges

### What is a bridge?
A bridge is a Data Link Layer device that connects LANs and selectively forwards frames using MAC addresses.

### What does a bridge inspect?
- source MAC address
- destination MAC address

### What is the purpose of a bridge?
- reduce collisions
- improve performance
- filter unnecessary traffic
- separate collision domains

### What layer does a bridge operate at?
Data Link Layer.

### Does a bridge split collision domains?
Yes.

### Does a bridge split broadcast domains?
Usually no.

---

## Repeater vs Bridge

| Repeater | Bridge |
|---|---|
| Physical Layer | Data Link Layer |
| Works with bits | Works with frames |
| No filtering | Filters traffic |
| Same collision domain | Separate collision domains |
| Extends distance | Improves performance |

---

## Store and Forward

### What is Store and Forward?
A bridge:
1. receives the full frame
2. stores it temporarily
3. checks MAC addresses
4. forwards only if necessary

### Why is Store and Forward useful?
It:
- reduces unnecessary traffic
- improves efficiency
- allows LANs of different speeds to connect

---

## Address Learning

### What is Address Learning?
The bridge automatically learns which MAC addresses belong to which ports.

### What information does the bridge learn?
- source MAC address
- incoming port

### What happens if destination MAC is unknown?
The bridge floods the frame to all ports except the incoming port.

### What is a transparent bridge?
A bridge using automatic address learning.

---

## Collision Domains

### What is a collision domain?
A network area where simultaneous transmissions can collide.

### How do bridges affect collision domains?
Each LAN segment connected to a bridge becomes a separate collision domain.

### How do repeaters affect collision domains?
Repeaters do not separate collision domains.

---

## Throughput Questions

### Formula without bridging

Perceived throughput per host:

LAN speed / total hosts

Example:
- 100 Mbps LAN
- 20 hosts

100 / 20 = 5 Mbps per host

---

### Formula with bridging

Perceived throughput per host:

LAN speed / hosts per segment

Example:
- 100 Mbps LAN
- bridge inserted
- 10 hosts per side

100 / 10 = 10 Mbps per host

### Why does bridging improve throughput?
Because:
- collisions stay local
- traffic is separated
- parallel communication becomes possible

---

## Principle of Locality

### What is the Principle of Locality of Reference?
Most traffic stays local between nearby devices.

### Why is this important?
If frequently communicating devices stay on the same LAN:
- bridge traffic decreases
- performance improves

---

## Loops in Bridged Networks

### Why are redundant bridges useful?
They improve reliability.

### What problem can redundant bridges create?
Loops.

### Why are loops dangerous?
They cause:
- duplicate frames
- endless forwarding
- bandwidth waste
- network instability

---

## Spanning Tree

### What is the purpose of Spanning Tree?
To create a loop-free logical topology.

### What is the Root Bridge?
The bridge with the lowest Bridge ID.

### What happens to unnecessary links?
They enter blocking state.

---

## Forwarding vs Blocking Ports

| Forwarding Port | Blocking Port |
|---|---|
| Actively forwards frames | Prevents loops |
| Part of spanning tree | Inactive for forwarding |

---

## Fixed Routing vs Address Learning

| Fixed Routing | Address Learning |
|---|---|
| Manual tables | Automatic learning |
| Hard to scale | Scalable |
| Requires admin updates | Self-learning |

---

## Ultra Important One-Line Facts

- Repeaters regenerate bits.
- Bridges inspect MAC addresses.
- Bridges reduce collision domains.
- Repeaters forward everything.
- Bridges use Store and Forward.
- Transparent bridges use Address Learning.
- Spanning Tree prevents loops.
- Lowest Bridge ID becomes Root Bridge.

Networking is basically engineers spending decades trying to stop packets from screaming into each other through copper wires.
