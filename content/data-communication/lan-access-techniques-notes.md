# LAN Access Techniques

## Why access control matters in a LAN

A LAN is only useful if stations can transmit data without creating chaos on the shared communication medium. Many devices may want to transmit at the same time, so the network needs rules that control who may access the medium and when.

This control is called **Medium Access Control (MAC)**. MAC is a fundamental requirement in LANs because it determines how stations share the network fairly and efficiently.

At a practical level, MAC answers questions like these:

- When may a station begin transmitting?
- What happens if two stations try to transmit at the same time?
- How is fairness maintained?
- How can performance remain acceptable as the network becomes busy?

## General MAC strategies

There are two broad ways to control access to the medium.

### Centrally controlled access

In a centrally controlled system, a station must obtain permission from a central controller before transmitting.

#### Advantages

- The logic required at each station is simple.
- Stations do not need to coordinate with one another directly.

#### Disadvantages

- The controller becomes a **single point of failure**.
- It can become a **bottleneck** because all requests pass through it.

A centralised design can simplify some decisions, but it creates dependency on one device. For this reason, distributed methods are usually more attractive in LANs.

### Distributed access

In a distributed system, stations cooperate according to common rules rather than asking a central controller for permission each time.

This is more common in practical LAN design because it avoids a single controlling bottleneck and supports decentralised operation.

## Three general MAC techniques

The notes group MAC techniques into three broad categories.

### Reservation

Reservation is based on a centralised strategy. The transmission medium is divided into time slots, and stations reserve slots in advance.

This approach is well suited to **stream traffic**, especially long and continuous transmissions that occur on an irregular basis. It is not the main focus of these notes.

### Round Robin

Round Robin is a distributed strategy. Stations take turns transmitting.

This is efficient when stations regularly have a lot of data to send. A well-known example is **Token Ring**, where access is effectively passed from station to station.

### Contention

Contention is also distributed. Stations compete for access whenever they need to transmit.

This is especially suitable for **bursty traffic**, meaning short and sporadic transmissions. It is simple, practical, and common in LANs where stations do not always have data to send.

## Contention-based access

A contention MAC technique has several defining characteristics:

- stations contend for access when needed
- the method is naturally distributed
- access is based on a first-come, first-served style
- the technique is relatively easy to implement
- it works well for bursty traffic

The trade-off is that collisions can occur when multiple stations decide to transmit at nearly the same time.

## Ethernet and CSMA/CD

One of the most important LAN technologies is **Ethernet**, especially in bus and star LAN environments.

Ethernet uses a contention-based MAC technique called:

**Carrier Sense Multiple Access with Collision Detection (CSMA/CD)**

This technique is defined in the **IEEE 802.3** standard.

### Breaking down the name

- **Carrier Sense** means a station listens to the medium before transmitting.
- **Multiple Access** means many stations share the same medium.
- **Collision Detection** means a transmitting station continues listening while it transmits so it can detect whether another transmission has interfered with its own.

## CSMA basic operation

Before transmitting a frame, a station first checks whether the medium is already in use.

### Basic sequence

1. The station listens for electrical activity on the medium. This is **carrier sensing**.
2. If the medium is idle, the station starts transmitting.
3. If the medium is busy, the station waits for a random amount of time.
4. After that random back-off period, it tries again.

This approach reduces the chance that multiple waiting stations will all retransmit at exactly the same instant.

### Normal CSMA example


[[IMAGE: csma_normal_operation.png]]

## Why collisions still happen in CSMA

Even if stations listen before transmitting, collisions can still occur. The reason is propagation delay. A station may believe the medium is free because another station's signal has not reached it yet.

For example, suppose station A begins transmitting. Before A's signal has had time to propagate across the whole medium, station C may also sense an idle line and begin transmitting. The two signals then interfere, producing a **collision**.

### Collision example

[[IMAGE: csma_collision_operation.png]]

## What a collision means

A collision is a garbled transmission caused when two or more signals overlap on the shared medium. The involved frames become corrupted and cannot be read correctly.

Without collision detection, recovery would depend on error control methods such as missing acknowledgements, timers, negative acknowledgements, or out-of-sequence frame handling. That makes recovery slower and increases extra traffic.

## Limits of plain CSMA

CSMA on its own has poor efficiency for several reasons:

- only one frame or acknowledgement can exist on the medium at a time in a shared bus style environment
- collisions waste medium time
- recovery may rely on timers and retransmissions
- extra control traffic reduces efficiency

To improve this, Ethernet extends CSMA into **CSMA/CD**.

## CSMA/CD basic operation

CSMA/CD keeps the carrier-sensing behaviour of CSMA, but adds active collision detection during transmission.

### Operational steps

1. Listen to the medium.
2. If clear, begin transmission.
3. Continue listening while transmitting.
4. If a collision is detected:
   - stop transmitting immediately
   - send a short **jamming signal**
   - wait a random period
   - retransmit later
5. If repeated collisions occur, use **binary exponential backoff** so the waiting period becomes more spread out.

### Why the jamming signal is useful

The jamming signal informs all stations that a collision has occurred. This helps ensure the corrupted event is recognised consistently across the network segment.

## Why CSMA/CD is better than plain CSMA

Collision detection provides major benefits:

- the transmitter resolves collision problems itself
- there is less dependence on higher-level error control to notice the failure
- the total time to send multiple frames is reduced
- link utilisation improves
- unnecessary acknowledgement traffic can be reduced in the ideal case where frames are assumed to arrive if no collision occurs

In other words, CSMA/CD turns collision handling into a fast local reaction rather than a slow recovery process based on timeouts.

## Frame size and collision detection

Collision detection only works properly if the frame is long enough.

### Why minimum frame size matters

If a frame is too short, a transmitting station may finish sending before a collision from a distant station has time to propagate back. In that case, the station would not detect the collision.

To prevent this, frames must meet a **minimum length** requirement.

### The Pad field

The IEEE 802.3 MAC frame includes a **Pad** field. Extra octets can be inserted so that a short frame reaches the minimum length needed for reliable collision detection.

This is an important design detail because it shows that frame format is influenced not only by addressing and payload needs, but also by physical timing constraints on the network.

## Ring LANs and token-based access

Ring LANs use a different philosophy. Instead of letting stations contend for access, they often use a **Round Robin** approach.

A ring LAN consists of repeaters connected by unidirectional links in a ring. Data moves bit by bit from one repeater to the next. Each repeater regenerates and forwards the bits it receives.

## Repeater functions in a ring LAN

Repeaters perform three main functions.

### Frame insertion

A repeater can place frames onto the transmission medium.

### Frame reception

As a frame passes through, the address field is checked. If the station recognises the address, it copies the full frame.

### Frame removal

A frame can be removed from the ring by not forwarding it onto the next link. Depending on the design, the addressed repeater or the original transmitter may remove the frame.

## Token Ring

The most well-known ring MAC technique is **IBM Token Ring**, defined in the **IEEE 802.5** standard.

### Core idea

A small control frame called a **token** circulates continuously around the ring. A station that wants to transmit must wait until it receives the token.

Once it gets the token, the station seizes it, removes it from circulation, and transforms it into the start of a data frame. It then adds the required fields and sends the complete frame around the ring.

When that frame eventually returns to the transmitting station, the station removes it and releases a new token back onto the ring.

### Visual operation sequence

[[IMAGE: token_ring_operation.png]]

## Token Ring frame structure

The token itself is very small. A full 802.5 data frame contains several fields such as delimiters, access control, frame control, addresses, data, checksum, and frame status.

[[IMAGE: token_ring_mac_frame_format.png]]

## Advantages and disadvantages of Token Ring

### Advantages

- access is fair because stations take turns
- performance is efficient under heavy traffic
- collisions are avoided by controlled token possession

### Disadvantages

- under light traffic, a station may wait unnecessarily for the token
- token maintenance is required
- tokens may be lost or duplicated
- one station usually has special responsibility for token management

Token Ring performs best when traffic is sustained and fairness is important. It is less attractive when traffic is light and stations would prefer immediate opportunistic access.

## Star LANs and hub-based operation

A star LAN uses a central component, usually called a **hub**. The behaviour of the network depends on whether the hub is shared-medium or switched.

## Shared-medium hub LAN

A **shared-medium hub** repeats a transmission from one station to all other stations.

This means:

- only one station can successfully transmit at a time
- the network behaves like a shared bus
- contention still exists
- the physical layout is star-shaped, but the logical behaviour resembles a bus

This is why it is often called a **star-shaped bus**.

### Visual configuration

[[IMAGE: hub_star_lan_configuration.png]]

## Switched LAN hub

A **switched LAN hub**, or switch, behaves very differently.

Instead of repeating every frame to all stations, the switch forwards a frame only to the addressed destination port. This allows multiple independent transfers to occur at the same time.

### How it works

- each host connects to a dedicated switch port
- separate transmit and receive links are used
- the switch knows which host is connected to which port
- store-and-forward technology is used to receive the frame, inspect it, and forward it correctly

### Visual configuration

[[IMAGE: switched_lan_configuration.png]]

## Why switched LANs perform better

Switched LANs provide several major benefits.

### Full-duplex communication

Because hosts use separate transmit and receive links, they can send and receive at the same time. This is **full-duplex** operation.

By contrast, bus LANs and shared-medium LANs operate in **half-duplex** mode because everyone shares the same medium.

### Simultaneous conversations

Since each host has a dedicated switch port, multiple host pairs can communicate simultaneously without colliding.

For example, host A can send to host B while host C sends to host D. This is a major improvement over shared media, where only one successful transmission can occupy the medium at a time.

### Store-and-forward behaviour

Store-and-forward switching means incoming frames can be buffered before forwarding. This allows the switch to:

- send frames to the correct port
- queue multiple frames destined for the same host
- avoid collisions on shared output paths

### Performance intuition

A single station on a switched LAN can achieve throughput close to link speed. On a shared LAN, multiple stations contending for the same medium reduce the effective throughput seen by each.

## Wireless LANs

Wireless LANs are standardised under **IEEE 802.11**.

The notes introduce two important wireless LAN architectures:

- **Basic Service Set (BSS)**
- **Extended Service Set (ESS)**

## Basic Service Set (BSS)

A BSS usually consists of either:

- a number of mobile stations working independently, or
- a number of mobile stations working with a central **Access Point (AP)**

This leads to two useful ideas:

- **Ad hoc BSS**, where stations communicate without an AP
- **Infrastructure BSS**, where stations communicate through an AP

### Visual view of BSS


[[IMAGE: bss_wireless_lan.png]]

## Extended Service Set (ESS)

An ESS usually consists of two or more infrastructure BSSs connected together, often through a distribution system that is typically a wired LAN.

In an ESS:

- multiple APs are connected through a distribution network
- mobile stations may communicate within one BSS or move between BSSs
- stationary stations such as servers or gateways can connect through the wired side of the system

### Visual view of ESS


[[IMAGE: ess_wireless_lan.png]]

## Why wireless LAN access is different

Wireless LANs still use a form of CSMA, but they do **not** use collision detection in the same way as wired Ethernet.

Instead, wireless LANs use **CSMA/CA**, which means:

**Carrier Sense Multiple Access with Collision Avoidance**

The reason is simple: on a wireless network, a transmitting station cannot always detect every collision directly.

## The hidden station problem

In wireless networks, some stations may be out of range of one another even though both can reach a common receiver.

Suppose station B and station C can both communicate with station A, but B and C cannot hear each other. If B transmits to A, C may still think the medium is free because it cannot hear B. If C also transmits, a collision occurs at A.

This is the **hidden station problem**.

### Visual explanation


[[IMAGE: hidden_station_problem.png]]

## CSMA/CA basic operation

To reduce the chance of collisions, wireless LANs use both timed waiting periods and control-message exchange.

### Important elements

- **RTS**: Ready To Send
- **CTS**: Clear To Send
- **SIFS**: Short Inter-Frame Space
- **DIFS**: Distributed Inter-Frame Space
- **NAV**: Network Allocation Vector

### Basic idea

1. A station senses the wireless medium.
2. After the required waiting interval, it sends an RTS.
3. The receiver replies with CTS if the transmission may proceed.
4. Data is sent.
5. An acknowledgement is returned.
6. Other stations defer access during the reserved period using the NAV.

### Visual CSMA/CA sequence
[[IMAGE: csma_ca_operation.png]]

## CSMA/CA and hidden stations

RTS and CTS help hidden stations because even if one station cannot hear another sender directly, it may hear the CTS from the receiver and realise that the medium is about to be used.

This reduces, though does not completely eliminate, the chance of collision.

### Visual hidden-station sequence


[[IMAGE: csma_ca_hidden_station_sequence.png]]

## Comparing wired and wireless access methods

| Feature | Wired Ethernet | Wireless LAN |
|---|---|---|
| Standard | IEEE 802.3 | IEEE 802.11 |
| Main method | CSMA/CD | CSMA/CA |
| Collision handling | Detect after it happens | Try to avoid before it happens |
| Medium | Cable or wired segment | Air interface, radio signals |
| Key challenge | Shared medium contention | Hidden stations and incomplete visibility |

## MAC frame formats

The notes end by comparing MAC frame structures across multiple LAN technologies.

[[IMAGE: mac_frame_formats_comparison.png]]

## Big-picture comparison of access techniques

### Contention approach

- used heavily in Ethernet
- efficient for bursty traffic
- simple and flexible
- may suffer collisions in shared-medium environments

### Round Robin approach

- used in Token Ring
- very fair under heavy load
- avoids collisions through orderly access
- may introduce delay when traffic is light

### Collision detection versus avoidance

- **Collision detection** works when a transmitter can monitor the medium effectively during transmission, which fits wired shared media.
- **Collision avoidance** is needed when such monitoring is unreliable, which fits wireless environments with hidden stations.

## Exam-style points to master

Make sure you can explain each of the following clearly:

1. the difference between centralised and distributed MAC
2. the difference between reservation, round robin, and contention
3. how CSMA works
4. why collisions happen even after carrier sensing
5. how CSMA/CD improves on plain CSMA
6. why minimum frame size matters in Ethernet
7. how Token Ring works using a circulating token
8. the difference between shared-medium and switched star LANs
9. why switched LANs support full-duplex and simultaneous communication
10. why wireless LANs use CSMA/CA instead of CSMA/CD
11. what the hidden station problem is
12. how RTS, CTS, SIFS, DIFS, and NAV help in wireless access control

## Quick memory summary

LAN access techniques determine how stations share a communication medium. Ethernet uses contention and CSMA/CD, which works well on wired shared media because stations can detect collisions. Token Ring uses a token and Round Robin access, which provides fairness and avoids collisions. Star LANs may behave like a shared bus or like a high-performance switched system depending on the hub type. Wireless LANs use CSMA/CA because hidden stations and radio propagation make collision detection unreliable. Across all these designs, the core goal is the same: fair, efficient, and reliable access to the medium.

## Glossary

**BSS**: Basic Service Set in wireless LANs.

**CSMA**: Carrier Sense Multiple Access.

**CSMA/CA**: Carrier Sense Multiple Access with Collision Avoidance.

**CSMA/CD**: Carrier Sense Multiple Access with Collision Detection.

**CTS**: Clear To Send.

**DIFS**: Distributed Inter-Frame Space.

**ESS**: Extended Service Set.

**Full-duplex**: Ability to send and receive simultaneously.

**Half-duplex**: Only one direction of communication at a time on the shared medium.

**Hidden station problem**: A wireless situation where two stations cannot hear each other but can both reach the same receiver.

**MAC**: Medium Access Control.

**NAV**: Network Allocation Vector.

**RTS**: Ready To Send.

**SIFS**: Short Inter-Frame Space.

**Store-and-forward**: Switching method where a frame is received and buffered before forwarding.

**Token Ring**: A ring-based LAN access method where a token controls transmission rights.
