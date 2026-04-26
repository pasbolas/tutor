# Hardware Addressing, MAC Addresses, and Types of Communication on a LAN

## Overview

Local Area Networks, or LANs, allow devices in the same local network to exchange data directly. For that to happen reliably, each device must be distinguishable from every other device on that LAN. This is the purpose of **hardware addressing**, commonly known as **MAC addressing**.

A **MAC address** is the hardware-level identifier used by a network interface on a LAN. It is the address that helps frames reach the correct device at the data link layer.

A typical Ethernet MAC address looks like this:

`00:40:05:1C:0E:9F`

This format represents a **48-bit address**, usually written as **12 hexadecimal digits** grouped into pairs.

## Why Hardware Addressing Exists

When multiple devices share the same LAN, the network needs a way to answer a simple question:

**Which exact device should receive this frame?**

Without unique hardware addresses, every frame would have to be examined by every device at a higher level, which would be wasteful and slow. MAC addressing solves this by allowing a frame to carry both:

- the sender's hardware address
- the receiver's hardware address

Because of this, communication on a LAN can be direct, efficient, and selective.

## MAC Address Structure

A MAC address is usually described as:

- **48 bits long**
- written in **hexadecimal**
- split into **6 bytes**
- commonly displayed as six two-digit groups separated by colons or hyphens

Example:

`00:40:05:1C:0E:9F`

Each hexadecimal digit represents 4 bits, so 12 hexadecimal digits represent 48 bits in total.

## MAC Addresses Inside Frames

Data sent across a LAN is carried in **frames**. A frame header includes addressing information so the network interface can decide whether the frame is relevant.

At a minimum, the frame contains:

- a **source MAC address**, which identifies the sender
- a **destination MAC address**, which identifies the intended receiver

This is important because the **Network Interface Card**, or **NIC**, can inspect the destination address before involving the CPU.

## Role of the NIC in Frame Filtering

The NIC is the hardware component that connects a computer to the LAN. It handles the low-level transmission and reception of frames.

Instead of asking the CPU to inspect every frame on the LAN, the NIC performs an initial filtering step:

- it reads the destination address in the incoming frame
- it compares that address against addresses it should accept
- it passes relevant data onward to the system
- it discards irrelevant frames

This improves performance because the CPU only gets interrupted when the incoming data is actually meant for that device, or when the frame belongs to a communication pattern the NIC is configured to accept.

## How the NIC Fits into the System

The NIC sits between the LAN and the rest of the computer.

- On one side, it communicates with the LAN and handles frame transmission and reception.
- On the other side, it exchanges data with the computer's processor and memory.

That means the NIC acts like a gatekeeper. It performs the first layer of acceptance or rejection before the data reaches the operating system.

[[IMAGE: nic_architecture_diagram_page_3.jpg]]

### What the diagram shows

The diagram illustrates a simple internal relationship:

- the **LAN connection** feeds into the **network interface hardware**
- the **network interface hardware** exchanges information with the **processor and memory**
- the NIC is responsible for receiving and transmitting frames on the LAN
- the processor and memory generate outgoing data and process incoming data after the NIC has accepted it

This separation of duties is one of the reasons LAN communication is efficient.

## Uniqueness Requirement

Every station on a LAN must have a hardware address that is unique on that LAN. If two devices were treated as though they had the same identity, frame delivery would become ambiguous.

Uniqueness is what allows the network to support direct station-to-station communication.

## Ways Hardware Addresses Can Be Allocated

Hardware addresses may be assigned in different ways depending on the technology and design of the system. The notes identify three broad allocation approaches.

### 1. Static allocation

In static allocation, the hardware manufacturer sets the address.

This is the traditional idea associated with a factory-assigned MAC address. The address is built into the network interface and stays associated with it unless special mechanisms are used to change it.

### 2. Dynamic allocation

In dynamic allocation, the station sets its own address at boot-up.

This means the address is not permanently fixed by the manufacturer. Instead, it may be assigned or chosen when the device starts.

### 3. Configurable allocation

In configurable allocation, an administrator sets the address.

This gives manual control over the address value. It can be useful in controlled environments, testing, virtualization, or situations where a particular addressing policy is required.

## Why Address Allocation Matters

The method of address allocation affects:

- how predictable device identity is
- how easy it is to manage devices
- whether addresses remain stable over time
- whether address conflicts are likely

Regardless of allocation method, the key rule remains the same:

**the address used on the LAN must be unique for correct communication.**

## MAC Addressing and Layers of Networking

MAC addresses operate at the **data link layer**. Their scope is local. They are used to move frames across the current LAN segment.

This is different from **IP addresses**, which are logical addresses used for communication across networks.

A useful distinction is:

- **MAC address** = local hardware identity used on the LAN
- **IP address** = logical network identity used for end-to-end routing across networks

So when data is being delivered within a LAN, the frame still needs a destination MAC address, even if the wider communication is based on IP.

## Practical Significance

Hardware addressing gives a LAN three major advantages:

### Efficient filtering

Devices can ignore frames not meant for them, reducing unnecessary processing.

### Reliable local delivery

The frame header explicitly states who sent the frame and who should receive it.

### Scalability on shared media

As more devices join the LAN, unique addressing continues to provide order and structure.

## Communication Types on a LAN

A LAN does not always send data in the same pattern. Sometimes one device needs to send data to one other device. Sometimes it needs to send to every device on the network. Sometimes it needs to send only to a selected group.

These three communication patterns are:

- **Unicast**
- **Broadcast**
- **Multicast**

Each pattern exists for a different purpose, and each one relies on a matching addressing method.

## Why Different Communication Types Are Needed

Not all network traffic is meant for the same audience.

For example:

- a file being sent from one computer to another should usually reach only one destination
- a discovery or announcement message may need to reach all devices on the LAN
- streaming data or group-based updates may need to reach only interested devices

Using one communication method for all cases would be inefficient. LAN technologies therefore support different delivery styles depending on the communication goal.

## Unicast Communication

### Definition

**Unicast** is **station-to-station communication**.

One sender transmits data to one intended receiver.

### Addressing requirement

Unicast depends on **unique MAC addresses**. Every NIC on the LAN has to be identifiable so that a frame can be sent to exactly one destination.

### How it works

When a device sends a unicast frame:

- the destination MAC address in the frame header is the unique address of one target device
- NICs on the LAN inspect the frame
- only the NIC whose address matches the destination accepts it
- other NICs discard the frame

### Typical uses

Unicast is the most common form of communication on a network. It is used for:

- direct file transfers
- normal client-server communication
- web requests and responses at the local delivery level
- device-to-device exchanges where only one receiver is intended

### Why it is efficient

Unicast avoids unnecessary delivery to unrelated devices. Only the intended receiver processes the data.

## Broadcast Communication

### Definition

**Broadcast** is **station-to-all-stations communication**.

One sender transmits a frame that every station on the LAN is expected to receive.

### Addressing requirement

Broadcast communication uses a special address that all NICs recognize.

For Ethernet, the broadcast address is:

`FF:FF:FF:FF:FF:FF`

This is an address of all ones in hexadecimal notation.

### How it works

When a frame carries the broadcast destination address:

- every NIC on the LAN recognizes that the frame is meant for all stations
- each NIC accepts the frame instead of discarding it
- the frame is delivered to every connected station within that broadcast domain

### Typical uses

Broadcast is useful when the sender does not yet know the exact target or when the message genuinely applies to everyone on the LAN.

Examples include:

- network discovery
- service announcements
- certain control and request messages on local networks

### Limitation of broadcast

Broadcast is useful, but it is also expensive. Because all devices must receive and examine the frame, excessive broadcast traffic can waste bandwidth and processing time.

For that reason, broadcast should be used only when the communication really needs to reach all stations.

## Multicast Communication

### Definition

**Multicast** is **station-to-some-stations communication**.

One sender transmits data intended for a selected group of devices, not just one device and not the entire LAN.

### Addressing requirement

Multicast requires a destination address that some stations are configured to recognize.

This means:

- devices that belong to the relevant group accept the frame
- devices outside the group ignore it

### How it works

A sender places a multicast address in the frame header. NICs that are configured to listen for that multicast group accept the traffic. Other NICs discard it.

### Typical uses

Multicast is valuable when the same data should be delivered to several receivers at once, but sending separate unicast copies would be inefficient and sending a broadcast to everyone would be wasteful.

Examples include:

- group media delivery
- collaborative applications
- distribution of data to subscribed receivers

### Why multicast matters

Multicast offers a balance between precision and reach:

- more targeted than broadcast
- more scalable than many repeated unicast transmissions

## Comparison of the Three Communication Types

| Communication Type | Sender To | Addressing Style | Who Accepts the Frame? | Efficiency Profile |
|---|---|---|---|---|
| Unicast | One station | Unique destination MAC | One intended receiver | Very efficient for one-to-one traffic |
| Broadcast | All stations | Special broadcast address | Every station on the LAN | Useful, but expensive if overused |
| Multicast | Some stations | Group destination address | Only subscribed or configured group members | Efficient for one-to-many group traffic |

## Relationship Between Communication Type and NIC Behavior

The NIC plays a key role in all three communication modes.

### In unicast

The NIC accepts the frame only if the destination MAC address matches its own unique address.

### In broadcast

The NIC accepts the frame because it recognizes the all-stations broadcast address.

### In multicast

The NIC accepts the frame only if it has been configured to listen for the relevant multicast address.

This behavior is what allows the same physical LAN to support multiple delivery models without chaos.

## Why Each Communication Type Needs Its Own Address

The notes emphasize that each communication type requires its own address. That idea is central.

A network cannot simply rely on one general addressing method for everything because the meaning of delivery changes depending on intent:

- if the message is for one device, the address must uniquely identify that device
- if the message is for everyone, all devices must recognize the same special address
- if the message is for a group, only selected devices must recognize the address

So the address does not just identify a destination. It also defines the **scope** of delivery.

## Real-World Intuition

A useful analogy is postal delivery:

- **Unicast** is like sending a letter to one named person at one address.
- **Broadcast** is like posting the same notice to every house in a neighborhood.
- **Multicast** is like sending a notice only to members of a particular club or group.

This analogy helps explain why the three forms exist and why they should not be confused.

## Common Misunderstandings

### A MAC address is not the same as an IP address

They serve different roles. MAC addresses are used for local frame delivery. IP addresses are used for broader network routing.

### The CPU does not inspect every frame first

The NIC performs the initial filtering. This is one of the reasons network communication is practical at scale.

### Broadcast does not mean internet-wide delivery

Broadcast is a LAN-level concept. It is intended for all stations on the relevant local network or broadcast domain, not all devices everywhere.

### Multicast is not the same as multiple unicasts

In multiple unicast transmissions, the sender creates separate copies for each destination. In multicast, a group-oriented destination mechanism is used so that delivery is more efficient.

### Unicast is still the default for most ordinary traffic

Even though broadcast and multicast are important, most everyday direct communication between two devices is unicast.

### A MAC address is usually represented in hexadecimal, not decimal

The hexadecimal form is compact and maps cleanly to the underlying binary value.

## Final Summary

Hardware addressing is the mechanism that allows devices on a LAN to identify one another and exchange data correctly. Each station uses a unique MAC address, frame headers include sender and receiver addresses, and the NIC filters incoming traffic before passing relevant data to the CPU. Address allocation may be static, dynamic, or configurable, but the central requirement remains uniqueness.

LAN communication then builds on that addressing foundation through three delivery modes: unicast, broadcast, and multicast. Unicast uses unique MAC addresses for one-to-one delivery. Broadcast uses the special address `FF:FF:FF:FF:FF:FF` for one-to-all delivery. Multicast uses group addresses for one-to-some delivery.

Taken together, MAC addressing and communication types explain how a LAN stays organized, efficient, and flexible while supporting many different kinds of traffic.
