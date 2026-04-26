# Introduction to Local Area Networks

## What a LAN is

A **Local Area Network (LAN)** is a private communications network used to connect computing resources within an organisation or within a limited geographical area such as a room, office, floor, building, or campus. A LAN allows devices to share data, services, storage, printers, and applications over a common communication system.

In a LAN, devices are attached to a shared transmission environment. Depending on the LAN design, that environment may be a physical cable, a central hub or switch, or a wireless medium. The key idea is that the devices are close enough to be connected economically and to communicate at relatively high speeds.

LANs were developed because organisations increasingly needed fast and reliable communication between many types of systems. Growth in personal computing, multimedia use, file sharing, and client server applications made local interconnection essential.

## Why LANs are important

LANs solve a practical problem: computing devices are more useful when they can communicate. Instead of every device working in isolation, a LAN allows an organisation to:

- share files and data quickly
- access common printers and storage devices
- support client server applications
- improve collaboration between users
- reduce duplication of hardware resources
- build internal communication systems with high data rates

A LAN is especially valuable because it offers **high-speed communication over short distances**. In these notes, LAN speeds are discussed in the context of rates up to **1 Gbps**, which highlights how LANs are designed for fast local traffic rather than wide-area communication over long distances.

## Key characteristics of LANs

A LAN is usually recognised by a few core characteristics:

- it is privately owned or controlled
- it covers a limited geographic area
- devices share a transmission medium directly or indirectly
- data is sent in small units called **frames**
- some access control method is needed so stations can use the shared medium fairly

That last point is important. If many stations try to use the network at once, there must be a rule for deciding who gets access and when. Without such control, transmissions would interfere with each other.

## How LANs are classified

LANs can be classified in three main ways.

### By topology or layout

Topology describes the physical or logical arrangement of devices and communication links. Common LAN topologies include:

- **Bus**
- **Ring**
- **Star**

Each topology affects how data moves through the network and how faults or congestion influence performance.

### By transmission medium

The medium is the physical or wireless channel used to carry data. Examples include:

- twisted pair cable
- other guided media
- wireless radio-based communication

The type of medium affects speed, installation cost, maintenance, and flexibility.

### By access method

Because multiple stations may need to use the network, a LAN must define how they gain access to the transmission medium. Common ideas include:

- contention-based access such as **CSMA**
- turn-taking approaches such as **Token-based access**

This access method is often called **access control** or **medium access control**.

## Broad LAN categories by role

LANs are not always used for the same purpose. The notes distinguish between three broad application-oriented LAN categories.

### PC LANs

PC LANs are associated with the **access layer**.

They are used to connect relatively low-cost devices such as:

- personal computers
- ordinary workstations
- small server devices
- user-facing endpoints

These LANs are common in most organisations because they support everyday staff access. They are usually cheaper to implement and maintain, but in return they tend to offer lower performance than networks designed for more specialised high-volume work.

### Backend LANs

Backend LANs are associated with the **core layer**.

They are used to connect high-cost or high-performance devices such as:

- mainframes
- supercomputers
- mass storage devices
- major data-processing systems

These LANs are designed for **bulk data transfer** and high performance. They are more expensive to implement and maintain, but they support faster and more demanding traffic.

### Backbone LANs

Backbone LANs are associated with the **distribution layer**.

Their role is to provide connectivity between different LAN segments, especially between PC LANs and backend LANs. Instead of having one large flat network, a backbone LAN helps interconnect multiple specialised LANs.

## Why one single LAN is usually a bad idea

Using one large LAN for everything seems simple, but it creates serious problems.

### Reliability problem

If the entire organisation depends on one LAN and that LAN develops a fault, the impact is widespread. A failure in a single shared network can disrupt many users and services at once.

### Capacity problem

As more devices are attached to the same LAN, competition for the medium increases. This reduces performance because more stations want access to the same shared resource.

### Cost problem

Not all devices have the same needs. Using an expensive high-performance LAN technology to connect ordinary low-cost PCs is inefficient and impractical. It makes more sense to use different LAN types for different roles.

Because of these issues, organisations often build layered LAN structures instead of relying on one universal LAN.

## LAN topologies

Topology is one of the most important concepts in LAN design because it influences traffic flow, fault tolerance, expansion, and access control.

## Bus topology

A **bus LAN** uses a linear transmission medium. All stations attach to the same main cable, often using taps.

### Main characteristics of a bus LAN

- the medium is linear
- there are no closed loops
- transmissions travel in both directions
- every attached device can see the transmission
- both ends of the bus are terminated
- the terminator removes the signal and prevents reflection

Because the bus is shared, all stations effectively listen to the same communication medium. This makes the design conceptually simple, but it also means stations compete for access.

### Why terminators matter

When a signal reaches the end of a cable, it should not bounce back into the network. A **terminator** absorbs the signal and prevents it from being reflected. Without termination, reflected signals could interfere with valid data transmission.

### Example

A classic example of a bus-based LAN technology is **Ethernet** in its traditional shared-medium form.

## Ring topology

A **ring LAN** is built from a set of interconnected repeaters connected in a ring configuration using point-to-point links.

### Main characteristics of a ring LAN

- data moves from one repeater to the next
- repeaters forward data bit by bit
- the links are unidirectional
- each station attaches at a repeater
- the signal must be physically removed from the network after circulation

The unidirectional nature of the ring is important. Data travels around the ring in one direction only, passing through intermediate repeaters until it reaches the destination.

### Example

A classic example of a ring LAN is the **IBM Token Ring**.

## Star topology

A **star LAN** connects all stations to a central device, commonly called a **hub**. In modern interpretations this central device may also be a switch.

### Main characteristics of a star LAN

- all stations connect to a central hub
- each station normally uses separate transmit and receive links
- all transmissions pass through the central device
- the behaviour of the LAN depends heavily on what kind of hub is used

The notes identify two broad hub types:

- **shared-medium hub**
- **switched-LAN hub**

This means two star LANs may look physically similar but behave very differently in terms of performance and contention.

### Example

An example of a star LAN mentioned in the notes is **ATM**.

## Visual summary of bus, star, and ring layouts

[[IMAGE: lan_topologies_bus_star_ring.png]]

## Comparing the three topologies

| Topology | Basic structure | Data flow style | Strengths | Limitations |
|---|---|---|---|---|
| Bus | One shared linear medium | Shared, bi-directional on the bus | Simple concept, historically common | Shared medium can become congested, faults may affect many devices |
| Ring | Devices attached through repeaters in a loop | Unidirectional circulation | Orderly flow, well suited to token-based control | Frames must be removed, ring behaviour depends on repeater operation |
| Star | All devices connect to central hub or switch | Through central device | Easy to manage and expand, wiring can be convenient | Central device becomes critical point of operation |

## Common characteristics of LANs regardless of topology

Even though topologies differ, LANs share some common ideas.

### Frames are the basic unit of transfer

Data is transmitted in small blocks called **frames**. A frame contains:

- user data
- control information

This is similar in spirit to other data link layer frame formats such as HDLC. The control information helps devices interpret the frame correctly.

### Fair access is necessary

Because multiple stations may need to use the same medium or network structure, access must be controlled fairly. This means the network must provide some mechanism so that one station does not dominate the medium while others are blocked.

This requirement leads directly into medium access control techniques, which are central to understanding how LANs really work.

## Intuition behind LAN design choices

A useful way to think about LAN design is to connect structure with purpose.

- **Bus LANs** emphasise a shared medium and simple attachment.
- **Ring LANs** emphasise controlled circulation and ordered forwarding.
- **Star LANs** emphasise centralised interconnection and easier physical management.
- **PC, backbone, and backend LANs** show that networks are often built to suit different layers of organisational need rather than one-size-fits-all deployment.

## Exam-style understanding points

When revising this topic, make sure you can clearly explain the following in your own words:

1. what a LAN is and why organisations use it
2. how LANs are classified by topology, medium, and access method
3. the difference between PC LANs, backend LANs, and backbone LANs
4. why a single large LAN is undesirable
5. how bus, ring, and star topologies differ
6. why frames and fair access control are fundamental to LAN operation

## Quick memory summary

A LAN is a high-speed private local network. It connects nearby devices so they can share resources and exchange frames efficiently. LANs can be understood from three angles: their topology, their transmission medium, and their access method. Different LAN categories serve different roles in an organisation, and different topologies lead to different traffic patterns and performance characteristics. No matter which form is used, every LAN needs a fair way to manage access to the shared communication environment.

## Glossary

**Access layer**: The part of the network that connects end-user devices such as PCs.

**Backend LAN**: A high-performance LAN used to connect powerful systems such as servers, storage, and mainframes.

**Backbone LAN**: A LAN used to interconnect other LANs.

**Bus topology**: A LAN layout where all devices share one linear transmission medium.

**Frame**: A block of transmitted data containing payload and control information.

**Ring topology**: A LAN layout where data circulates through a ring of repeaters.

**Star topology**: A LAN layout where all devices connect to a central hub or switch.

**Terminator**: A device placed at the end of a bus cable to absorb the signal and stop reflections.
