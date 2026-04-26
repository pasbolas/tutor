# Internetworking, Universal Service, Routers, and IP Datagrams

## Introduction

A local area network, or LAN, allows computers on the same network technology to communicate efficiently. The difficulty begins when an organisation uses multiple LAN technologies at the same time. This is common in real environments because networks often grow gradually through upgrades, mergers, departmental purchases, and legacy systems. Once different technologies coexist, computers can no longer assume that every other host speaks the same low-level networking language. This is the central problem that internetworking is designed to solve.

## Why Different LAN Technologies Create Problems

Different LANs may be incompatible for several reasons:

- They can use different frame formats.
- They can rely on different electrical characteristics, such as wiring standards and signal levels.
- They can use different local addressing approaches.

Because of these differences, a host attached to one LAN technology cannot automatically communicate with a host attached to another. Without an additional system in between, the organisation ends up with isolated network islands rather than one unified communication system.

In practical terms, this means that a company may own many computers and many networks, yet still fail to provide seamless communication between users.

## The Idea of Universal Service

Universal service means that any user on any host should be able to communicate with any other user, regardless of the physical network technology underneath. The user should not need to know whether the destination lies on Ethernet, Wi-Fi, fibre, or any other LAN implementation. The network should hide this complexity.

This idea is similar to the telephone system. A person can call another person without needing to understand the exact details of the transmission medium, switching infrastructure, or hardware at the other end. Networking aims for the same level of simplicity.

Universal service is important because it turns networking from a collection of disconnected technical systems into a practical communication service for people and organisations.

## Internetworking as the Solution

Internetworking introduces a way to connect separate physical networks so that they behave like parts of one larger communication environment. Instead of forcing every LAN technology to become identical, internetworking builds a layer above them that makes communication possible across differences.

Two major ingredients make this possible:

1. **Special hardware**, which physically connects separate networks.
2. **Special software**, which gives all hosts a common way to address and package data.

Together, these allow data to move from one network to another even when the underlying LAN technologies are different.

## What an Internet Really Is

An **internetwork**, often shortened to **internet**, is a collection of connected physical networks. Each individual LAN still exists as its own network, but internetworking allows them to operate together as part of a larger system.

The key idea is that an internet is not limited to one building, one department, or one technology. As long as networks can be interconnected and routing decisions can be made, the overall system can continue to grow.

This also explains why the word *internet* is broader than just the public Internet. In networking theory, an internet simply means interconnected networks.

## Example of a Small Internet

A small internet can be formed by linking a few LANs together. Even when each LAN serves its own group of hosts, the interconnections allow traffic to move across the wider system.

[[IMAGE: 01_small_internet_overview.png]]

This type of diagram is useful because it shows an important principle: individual networks remain separate physical entities, but they participate in one broader communication structure.

### Extension Devices Inside a Network

Before full internetworking happens, a single LAN may be expanded using local extension devices such as repeaters or bridges. These devices help extend the reach of communication within that LAN technology.

[[IMAGE: 02_extension_device_in_small_internet.png]]

An extension device does not solve the universal service problem by itself. It only helps extend or organise communication within a compatible local network environment. To communicate across different network technologies, a higher-level internetworking solution is still needed.

### Routed Connectivity Between LANs

Once separate LANs are linked using routing devices, communication can move beyond a single local technology boundary.

[[IMAGE: 03_routed_segment_in_small_internet.png]]

This matters because the goal is not merely to enlarge one LAN, but to enable communication across many LANs. That is the step from simple network extension to true internetworking.

## Example of a Larger Internet

As more networks are interconnected, the resulting internet becomes larger and more complex. Multiple routers may connect many distinct physical networks, and traffic can pass along several possible paths.

[[IMAGE: 04_large_internet_example.png]]

This larger view highlights several important facts:

- An internet can contain many physical networks.
- Routers can connect multiple networks, not just two.
- Scale is flexible, but greater size introduces concerns such as performance, reliability, and efficient routing.

There is no strict size limit in the concept itself. The real limits come from engineering trade-offs such as delay, congestion, manageability, redundancy, and cost.

## Why MAC Addresses Alone Are Not Enough

Local network technologies typically rely on MAC addresses. These work well inside a single LAN, but they are not a complete solution for internetworking.

They fall short for several reasons:

- They are designed for local delivery, not end-to-end communication across many networks.
- They do not provide a convenient global addressing scheme for the entire internet.
- They do not naturally support efficient summary routing across large interconnected systems.
- They are tied to specific LAN technologies and frame formats.

Internetworking therefore requires a higher-level addressing method that works across all connected networks, not just within one.

## Routers as the Hardware Component

A router is a special-purpose computer used to interconnect networks. It is not a mysterious black box. Like other computers, it contains processing power, memory, and network interfaces. The difference is its job: it receives data from one network, decides where that data should go next, and forwards it toward the correct destination.

A router must have a physical connection to each network it serves. This is why a router needs the correct network interface for each attached LAN. Once connected, it can pass traffic between those LANs and help provide universal service.

In real organisations, routers are often deployed in groups rather than as a single device. Multiple routers improve performance, expand reach, and provide redundancy so that communication can continue even if one route or one device fails.

## What a Router Actually Does

At a high level, a router performs four core functions:

- It receives a packet from one network.
- It examines the destination information.
- It chooses an appropriate next path.
- It forwards the packet onto another network.

The router therefore acts as the decision point between networks. It is responsible for moving data across boundaries that a normal host on a single LAN could not cross by itself.

## Why Internet Protocol Is Needed

Even with routers in place, direct communication between different LAN technologies is still difficult if every network uses its own local conventions. A common software layer is needed to hide those differences.

The Internet Protocol, or IP, provides that common layer by introducing:

- A single globally unique addressing scheme.
- A standard packet format that all participating hosts and routers understand.

This is the key step that transforms a collection of separate LANs into an internet.

## Globally Unique Addressing

A global addressing scheme is necessary because each destination in the wider internetwork must be identifiable beyond its local LAN. If addressing stayed purely local, routers would have no universal way to interpret the final destination.

IP solves this by assigning network-layer addresses that work across the whole internetwork. These addresses sit above local hardware addresses. In other words, a device may still use a MAC address on its own LAN, but IP provides the end-to-end identity needed for communication across many networks.

This separation of roles is important:

- **MAC addressing** handles local delivery on a specific LAN.
- **IP addressing** handles internetwork delivery across multiple networks.

## The Packet or Datagram

IP also defines a standard unit of transfer called a **packet** or **datagram**. This gives all hosts and routers a common structure for sending data through the internetwork.

A datagram typically contains two broad parts:

- A **header**, which stores control information needed for delivery.
- A **body**, which carries the actual payload data.

Because every participating device understands this structure, routers can inspect the necessary control fields and forward the packet correctly even when the underlying networks differ.

## Structure of the IP Datagram

[[IMAGE: 05_ip_datagram_structure.png]]

The diagram of the IP datagram shows that the header contains several fields with distinct purposes. The most important ideas behind them are:

### Version

This identifies which version of IP is being used. Devices must know the version so they can interpret the rest of the header correctly.

### Header Length

This tells where the header ends and where the payload begins. Since optional fields may sometimes be present, the header is not always the same size.

### Service Type

This field is related to how the packet may be treated in terms of service expectations or priority.

### Total Length

This indicates the complete size of the datagram, including both header and payload.

### Identification, Flags, and Fragment Offset

These fields are associated with fragmentation. If a packet must be split to travel across a network with smaller size limits, these values help the receiving side recognise and reassemble the pieces correctly.

### Time To Live

This limits how long a packet can remain in the network. Each routing step reduces the value. If it reaches zero, the packet is discarded. This prevents packets from circulating forever due to routing loops.

### Type or Protocol

This indicates what kind of higher-layer data is being carried, such as whether the payload belongs to TCP, UDP, or another protocol.

### Header Checksum

This helps detect corruption in the header during transmission.

### Source and Destination IP Address

These fields identify where the packet came from and where it is supposed to go. They are fundamental to routing.

### Options and Padding

These are optional parts of the header. They are not always present, but when used they allow extra control information. Padding helps align the header properly.

### Beginning of Data

This marks the start of the payload carried inside the packet.

## How a Datagram Moves Across an Internet

[[IMAGE: 06_ip_datagram_across_the_internet.png]]

This diagram illustrates a powerful networking idea: the packet keeps its network-layer identity while travelling across multiple physical networks. The underlying local transmission details may change from one LAN to another, but the IP datagram continues to provide a consistent structure for end-to-end delivery.

This means that the sender and receiver can communicate across a chain of separate networks without needing to understand each intermediate LAN technology in detail.

## The Internet as a Virtual Network

An internetwork is often described as a **virtual network**. That does not mean it is imaginary. It means the user experiences one communication system even though the system is actually built from many separate physical networks underneath.

From the user perspective, there is one end-to-end communication path. From the engineer perspective, that path may cross several LANs, several routers, and several transmission technologies.

This abstraction is one of the most important ideas in networking. It allows complexity to be hidden while still enabling large-scale communication.

## Relationship Between Routers and IP

Routers and IP work together:

- Routers provide the physical interconnection and forwarding function.
- IP provides the logical addressing and standard packet format.

Without routers, networks would remain physically disconnected. Without IP, routers would not have a universal language for end-to-end delivery across different LANs.

Their combination is what makes universal access possible.

## Final Summary

- Different LAN technologies can create isolated network islands.
- Universal service means any host should be able to communicate with any other host without needing to understand the underlying network technology.
- Internetworking solves this by combining physical interconnection hardware with common communication software.
- Routers interconnect networks and forward packets between them.
- IP provides a globally unique addressing scheme and a standard packet format.
- MAC addresses remain useful for local delivery, but IP is needed for communication across multiple networks.
- The IP datagram contains both control information and payload data.
- Internetworks are virtual in the sense that they unify many physical networks into one logical communication system.

## Exam-Style Understanding Check

1. Why can hosts on different LAN technologies fail to communicate directly?
2. What does universal service mean in networking?
3. How is an extension device different from a router in purpose?
4. Why are MAC addresses not sufficient on their own for large-scale internetworking?
5. Why is a router described as a special-purpose computer?
6. Why is a global addressing scheme necessary for internetworking?
7. What is the difference between a MAC address and an IP address in purpose?
8. Why does the Time To Live field exist?
9. What is meant by calling an internet a virtual network?
10. How do routers and IP work together to make internetworking possible?
