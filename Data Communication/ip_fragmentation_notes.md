# IP Fragmentation

## Core idea

IP fragmentation is the process of splitting one IP datagram into smaller datagrams, called fragments, so that each one can pass through a network whose Maximum Transmission Unit, or MTU, is smaller than the original datagram size.

A datagram can travel across multiple networks on its way to the destination. Each network technology has its own frame format and its own MTU limit. Because of that, a datagram that fits on one LAN may be too large for the next LAN on the path.

## Why fragmentation exists

When an IP datagram is forwarded across a LAN, it is encapsulated inside that LAN's frame. The IP datagram becomes payload inside the frame, but the frame cannot exceed the MTU supported by that LAN.

The slides explain that different LAN technologies can carry different maximum amounts of data. For example:

- Ethernet MTU = 1500 bytes
- Token Ring at 16 Mbps MTU = 17,914 bytes

That means the complete IP datagram, header plus data, must be less than or equal to the MTU of the outgoing network.

## Encapsulation across an internetwork

As a datagram moves from source host to destination host, it may cross several LANs and routers. At each hop, the IP datagram is placed into a new data-link frame suitable for the next network.

[[IMAGE: encapsulation_at_work.png]]

The key point from this diagram is that the IP datagram remains the network-layer unit being forwarded, while the surrounding frame header changes from network to network.

## The IP header fields that matter for fragmentation

The general IPv4 datagram header includes many fields, but fragmentation mainly depends on a small subset.

[[IMAGE: ip_datagram_header_format.png]]

### Relevant fields

**Total Length**  
The total size of the datagram in bytes, including both header and data.

**Identification**  
A value used to identify which fragments belong to the same original datagram. Every fragment created from one original datagram carries the same Identification value.

**Flags**  
Used to indicate fragmentation status. In the context of these notes:

- one bit indicates whether fragmentation is permitted
- another bit indicates whether more fragments follow

In the slide examples:
- `1` means more fragments are still to come
- `0` means this is the last fragment

**Fragment Offset**  
Shows where the data in this fragment belongs relative to the data area of the original datagram. This field is measured in units of **8 bytes**, not single bytes.

## MTU and the fragmentation problem

A datagram may leave the source on one network and later encounter a smaller MTU on another network.

[[IMAGE: mtu_in_internetwork_example.png]]

In the example above, a path includes:

- Net 1 with MTU 1500
- Net 2 with MTU 1000
- Net 3 with MTU 1500

A datagram that fits on Net 1 might still need to be fragmented before it can cross Net 2.

## When a router fragments a datagram

Routers usually make the fragmentation decision. The router examines:

- the MTU of the outgoing network
- the size of the incoming datagram
- the size of the IP header

From that, it calculates:

- the maximum data payload each fragment can carry
- how many fragments are needed

## What the fragmentation process does

The original datagram is not sent as one piece anymore. Instead:

- copies of the original IP header are made
- each copy becomes the header of one fragment
- the original data field is split across the fragments
- some header fields are updated for each fragment

[[IMAGE: mtu_and_fragmentation_at_work.png]]

Every fragment is a valid IP datagram in its own right. It has its own IP header and can be routed independently.

## Fields that change during fragmentation

The slides identify three header fields that are especially important during fragmentation:

- **Flags**
- **Fragment Offset**
- **Identification**

### Identification

Every fragment created from the same original datagram carries the same Identification value. This lets the destination host group related fragments together during reassembly.

### Flags

The Flags field tells the receiver whether:

- the packet is fragmented
- more fragments are still expected

A receiving host knows it has reached the final fragment when the relevant flag indicates that no more fragments follow.

### Fragment Offset

The Fragment Offset tells the receiver where this fragment's data belongs inside the original data field.

Because the offset is measured in 8-byte units, the offset value is:

`starting byte position of fragment data / 8`

This is why fragment boundaries are often chosen so the fragment data size is a multiple of 8 bytes, especially for all fragments except the last one.

## Worked example from the slides

The diagram set in the slides gives a full example of fragmentation.

[[IMAGE: ip_fragmentation_offset_example.png]]

### Original datagram

From the slide:

- Total Length = 4020 bytes
- Data bytes = 0000 to 3999
- Therefore header length = 20 bytes

### Fragmented result

The original datagram is split into three fragments.

**Fragment 1**
- Total Length = 1420
- Data bytes = 0000 to 1399
- Data size = 1400 bytes
- More fragments flag = 1
- Offset = 0 / 8 = 0

**Fragment 2**
- Total Length = 1420
- Data bytes = 1400 to 2799
- Data size = 1400 bytes
- More fragments flag = 1
- Offset = 1400 / 8 = 175

**Fragment 3**
- Total Length = 1220
- Data bytes = 2800 to 3999
- Data size = 1200 bytes
- More fragments flag = 0
- Offset = 2800 / 8 = 350

[[IMAGE: ip_fragmentation_header_fields_example.png]]

### What this example shows clearly

- all three fragments keep the same Identification value, `14,567`
- the first two fragments have the "more fragments" indicator set
- the last fragment clears that indicator
- each offset tells the destination exactly where that fragment's data belongs in the original payload
- the last fragment can be smaller than the earlier ones

## Reassembly at the destination

The destination host, not the router, is responsible for reassembly.

This design makes sense because different datagrams belonging to the same higher-level message do not have to follow the same path. Routes may also change dynamically while traffic is in transit. The destination is the only place guaranteed to see all fragments that eventually arrive.

To reassemble the datagram, the destination host uses:

- the **Flags** field to detect that a datagram is fragmented and to identify the last fragment
- the **Identification** field to group related fragments together
- the **Fragment Offset** field to place each fragment's data into the correct location

## What happens if a fragment is lost

Reassembly is effectively all or nothing.

If one fragment is missing:

- the destination host temporarily stores the fragments that did arrive
- it waits only for a fixed period of time
- if the missing fragment does not arrive in time, the incomplete reassembly is discarded

This means a single lost fragment prevents successful reconstruction of the original datagram.

## Fragmenting a fragment

A fragment can itself be fragmented again if it later reaches another network with an even smaller MTU.

That means fragmentation can happen more than once along a route.

[[IMAGE: fragmenting_a_fragment_example.png]]

### Example in the slide

In the earlier three-fragment example, Fragment 2 originally carried bytes 1400 to 2799. Later, that fragment encounters a smaller MTU and is split again into:

**Fragment 2.1**
- Total Length = 820
- Data bytes = 1400 to 2199
- More fragments flag = 1
- Offset = 175

**Fragment 2.2**
- Total Length = 620
- Data bytes = 2200 to 2799
- More fragments flag = 1
- Offset = 275

The original Fragment 1 and Fragment 3 remain unchanged in this example.

### Important consequence

The destination host does not need to know whether a received fragment came directly from the original datagram or from a fragment that was fragmented again later. It simply uses Identification, Flags, and Fragment Offset to rebuild the original data field.

## Summary you should remember

IP fragmentation exists because different networks support different MTU sizes.

A router fragments a datagram when the outgoing network cannot carry it in one piece.

Each fragment:

- gets its own IP header
- carries the same Identification value as the original datagram
- uses the Flags field to show whether more fragments follow
- uses the Fragment Offset field, in 8-byte units, to show where its data belongs

Reassembly happens only at the destination host. If even one required fragment is lost, the original datagram cannot be fully rebuilt.

## Exam-focused quick checks

**What is MTU?**  
The maximum size of data a network technology can carry inside one frame.

**Who usually performs fragmentation?**  
A router forwarding the datagram onto a network with a smaller MTU.

**Who performs reassembly?**  
The destination host.

**Why is Fragment Offset measured in 8-byte units?**  
That is the format defined by the IPv4 header field, and it lets the receiver locate each fragment's data within the original payload.

**Which fields are most important for fragmentation and reassembly?**  
Identification, Flags, Fragment Offset, and Total Length.
