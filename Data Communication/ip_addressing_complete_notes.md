# IP Addressing, Routing, Subnetting, and CIDR

## Overview

These notes bring together the full topic of IPv4 addressing, packet routing, subnet masks, classful and classless addressing, CIDR notation, subnetting calculations, and variable-length subnet allocation. The goal is to explain not just what each concept means, but how the pieces fit together in a real network.

At the centre of the topic is one core idea: an internet is a collection of many networks connected by routers, so devices need a consistent addressing system that works across all of them.

## Why IP addressing exists

A network of networks still needs a universal way to identify destinations. Local technologies such as Ethernet have their own hardware addressing formats, but those formats do not scale cleanly across many interconnected networks. IP provides an addressing scheme that sits above the physical network and gives the internet a common way to move packets from source to destination.

Key ideas:

- Every host or router interface that participates in an IP network needs an IP address.
- The address used in an IP packet is independent of the physical address used on a local link.
- This separation allows different physical networks to be connected into one larger internet.

[[IMAGE: p02_multi_node_internet.jpeg]]

Insert the image above where you explain that the internet is made of many physical networks connected by routers.

## IPv4 address structure

An IPv4 address is **32 bits long**. It is divided into two logical parts:

- **Network prefix**: identifies the physical or logical network.
- **Host suffix**: identifies a specific host or interface on that network.

This hierarchy is essential. Routers do not need to know every host on the internet individually. They mainly need to know how to reach networks. Once a packet reaches the destination network, the final router can use the full address to deliver toward the correct host.

### Why the prefix and suffix split matters

Without a prefix and suffix structure, routing tables would become too large to manage. By grouping many hosts under one network prefix, the internet becomes scalable.

A useful way to think about it is:

- The **network prefix** tells routers where the destination network is.
- The **host suffix** tells the local network which exact interface should receive the packet.

## Dotted-decimal notation

Humans do not usually read 32-bit binary numbers directly. Instead, IPv4 addresses are written in **dotted-decimal notation**.

A 32-bit address is split into four 8-bit parts called **octets**. Each octet is written as a decimal number from 0 to 255.

Examples:

- `129.52.6.0`
- `128.10.2.3`
- `128.128.255.0`

This format is compact and readable, but it hides the actual bit pattern, which becomes important when deciding address classes or applying subnet masks.

## Classful addressing

Early IPv4 used **classful addressing**. In this scheme, the address space was divided into fixed classes. Each class had a fixed split between the network prefix and the host suffix.

[[IMAGE: p07_classful_ip_addressing_scheme.png]]

Insert the image above where you introduce the fixed Class A, B, C, D, and E layout.

### Main address classes

| Class | Leading bits | First octet range | Typical prefix length | Typical host length | Purpose |
|---|---|---:|---:|---:|---|
| A | `0` | 0 to 127 | 8 bits | 24 bits | Very large networks |
| B | `10` | 128 to 191 | 16 bits | 16 bits | Medium networks |
| C | `110` | 192 to 223 | 24 bits | 8 bits | Small networks |
| D | `1110` | 224 to 239 | N/A | N/A | Multicast |
| E | `1111` | 240 to 255 | N/A | N/A | Reserved |

### Reading the class from an address

In classful addressing, the first few bits identify the class automatically. That means the address is **self-identifying**.

Examples:

- `10.0.0.37` is Class A, so the first octet is the network prefix.
- `128.10.0.101` is Class B, so the first two octets form the network prefix.
- `192.5.48.85` is Class C, so the first three octets form the network prefix.

[[IMAGE: p14_classful_ip_address_values.png]]

Insert the image above where you explain how the first bit patterns map to classes.

## Classful addressing in practice

Consider the address `128.10.0.101`.

- The first octet is 128, so it is in the Class B range.
- A Class B address uses the first two octets as the network prefix.
- Therefore, the network is `128.10` and the host part is `0.101`.

Now consider `128.211.28.101`.

- This is also Class B.
- Its network prefix is `128.211`.
- Its host portion is `28.101`.

Even though both are Class B addresses, they belong to different networks because their prefixes differ.

[[IMAGE: p08_classful_addressing_example.jpeg]]

Insert the image above where you explain how hosts on different prefixes require routing between networks.

### Routers need one address per connected network

A router connects multiple networks, so it must have one IP address on each network connection. This is why routers usually have several IP addresses, not just one.

[[IMAGE: p16_classful_addressing_example_with_router_interfaces.jpeg]]

Insert the image above where you explain that a router is addressed separately on every network it touches.

## Routing of IP packets

Routers forward packets based on the **destination IP address**. The destination prefix tells the router which network the packet should move toward.

A good analogy is postal delivery:

- A national sorting centre does not need the exact house first.
- It first routes based on larger location information.
- A local office closer to the destination then uses more detailed address information.

IP routing works similarly:

- Routers far from the destination mainly care about the **network prefix**.
- The final router on or near the destination network uses the **full address** to deliver toward the correct host.

This layered decision-making is what makes routing efficient.

## Problems with classful addressing

Classful addressing was simple, but it wasted address space badly.

### Main limitations

- The split between network and host bits was fixed.
- A network that needed slightly more than a Class C block had to take a much larger Class B block.
- Many allocated addresses stayed unused.
- The global IPv4 address space began to run out.

This is why IPv4 moved toward **subnetting** and **classless addressing**, where the prefix length can stop on any bit boundary.

## Classless addressing and subnet masks

In classless addressing, the network prefix is not inferred from the class. Instead, it is defined explicitly by a **mask**.

A subnet mask is a 32-bit value made of:

- a contiguous run of `1` bits
- followed by a contiguous run of `0` bits

The `1` bits mark the network portion. The `0` bits mark the host portion.

Examples:

- `/8` = `255.0.0.0`
- `/16` = `255.255.0.0`
- `/24` = `255.255.255.0`
- `/25` = `255.255.255.128`
- `/26` = `255.255.255.192`
- `/27` = `255.255.255.224`
- `/28` = `255.255.255.240`

CIDR notation writes the prefix length after a slash. For example:

- `192.4.10.0/24`
- `128.1.0.0/16`

[[IMAGE: p19_classless_ip_addressing_allocation.jpeg]]

Insert the image above where you introduce mask-based addressing and show that different networks can use different prefix lengths.

## How routers use a mask

To test whether a destination belongs to a particular network, a router applies the mask to the destination address using a bitwise AND operation.

If:

- `A` is a known network address
- `M` is the mask for that network
- `D` is the destination IP address

then the router checks whether:

`D AND M = A`

### Example

Suppose:

- Network address `A = 192.4.10.0`
- Destination `D = 192.4.10.3`
- Mask `M = 255.255.255.0`

Applying the mask to the destination clears the host bits:

- `192.4.10.3 AND 255.255.255.0 = 192.4.10.0`

Because the result matches `A`, the router knows the destination belongs to the `192.4.10.0/24` network.

### Important consequence

For any valid host address in a subnet, applying the subnet mask always produces the **network address** of that subnet.

That fact is one of the most important rules in IPv4 subnetting and routing.

## Routing tables in classless networks

A routing table stores entries such as:

- destination network
- mask
- next hop

If a router finds a match, it forwards the packet according to the next hop. If the destination network is directly attached, the packet can be delivered directly instead.

[[IMAGE: p26_ip_routing_table_classless_addressing.png]]

Insert the image above where you explain how a router matches destination networks to next-hop information.

### Reading the example routing logic

In the example routing table:

- `30.0.0.0` with mask `255.0.0.0` is forwarded toward `40.0.0.7`
- `40.0.0.0` is directly reachable
- `128.1.0.0` is directly reachable
- `192.4.10.0/24` is reached through `128.1.0.9`

This shows the two basic routing outcomes:

1. **Deliver direct** when the network is attached to the router.
2. **Forward to a next hop** when another router is needed.

## Special IPv4 addresses

Some IP address forms are reserved and should not be assigned to ordinary hosts.

### Directed broadcast address

A directed broadcast is formed by taking a valid network prefix and setting **all host bits to 1**. It targets all hosts on that specific network.

Example:

- For `192.168.1.0/24`, the directed broadcast is `192.168.1.255`.

### Limited broadcast address

`255.255.255.255` is used for broadcast on the local network segment only.

### This-computer address

`0.0.0.0` can represent "this host" or "unknown address" in boot-time contexts.

### Loopback address

Addresses in `127.0.0.0/8`, especially `127.0.0.1`, refer back to the same machine and are used for local testing and software communication inside the host.

## Routers and multi-homed hosts

A key principle of IP addressing is that an IP address identifies a **connection between an interface and a network**, not the computer as a whole.

That means:

- A computer with one network interface usually has one IP address on that network.
- A device with multiple interfaces, such as a router, needs one IP address for each network connection.
- A multi-homed host also needs one address per connected network.

[[IMAGE: p51_router_addressing_example.png]]

Insert the image above where you explain that each router interface belongs to a different network and therefore needs its own IP address.

## Prefix length and subnet masks

Subnetting is the process of dividing a larger IP block into smaller logical networks. It allows an organisation to use address space efficiently, separate departments or sites, reduce broadcast domains, and build routing structures that scale.

A subnet mask is a 32-bit pattern of contiguous `1` bits followed by contiguous `0` bits.

- `1` bits mark the network portion
- `0` bits mark the host portion

CIDR notation is usually the quickest way to describe a subnet because it tells you exactly how many leading bits belong to the network.

## Why subnetting exists

A single large address block is often too coarse. One organisation may need many smaller networks instead of one huge flat network. Subnetting solves this by taking bits from the original host portion and reusing them as additional network bits.

That means subnetting changes the balance between:

- how many subnetworks can exist
- how many hosts can fit inside each subnet

The more bits you borrow for subnetting, the more subnets you create, but each subnet can hold fewer hosts.

## Core subnetting formulas

Suppose you start with a block and borrow `n` host bits for subnetting.

### Number of subnets

`2^n`

### Total addresses per subnet

If `m` host bits remain, total addresses per subnet are:

`2^m`

### Usable host addresses per subnet

Traditionally:

`2^m - 2`

Two addresses are reserved in each ordinary subnet:

- the **network address**: all host bits are `0`
- the **broadcast address**: all host bits are `1`

## Interpreting the network and broadcast addresses

Within any subnet:

- The **first address** identifies the subnet itself.
- The **last address** is the directed broadcast for that subnet.
- The addresses in between are usable for hosts.

This rule is fundamental. If you can identify the network address, the broadcast address, and the host range, you can fill out almost any subnetting table.

## The magic number method

A fast manual technique for subnetting is the **magic number** approach.

### Step 1: Find the subnet mask

Example: `/26` means `255.255.255.192`

### Step 2: Find the interesting octet

Move left to right and find the **last octet that is non-zero and less than 255**.

For `255.255.255.192`, the interesting octet is `192` in the fourth octet.

### Step 3: Compute the magic number

`256 - 192 = 64`

So the subnet block size is **64** in that octet.

### Step 4: Generate subnet network addresses

Starting from the first subnet network, keep adding the magic number in the interesting octet:

- `192.168.1.0`
- `192.168.1.64`
- `192.168.1.128`
- `192.168.1.192`

Those are the network addresses of the `/26` subnets inside `192.168.1.0/24`.

## Worked example: divide 192.168.1.0/24 into 2 subnets

Start with:

- network block: `192.168.1.0/24`
- host bits in original block: `8`

A `/24` gives:

- `2^8 = 256` total addresses
- `256 - 2 = 254` usable host addresses

[[IMAGE: p32_basic_subnetting_example_192_168_1_0_24.png]]

Insert the image above where you introduce the original `/24` block and show the initial network and host split.

### How many bits must be borrowed?

To create **2 subnets**, borrow **1 bit**:

- `2^1 = 2` subnets

That changes the mask from `/24` to `/25`.

- Dotted-decimal mask: `255.255.255.128`
- Host bits remaining: `7`

[[IMAGE: p33_subnet_mask_extension_to_25.png]]

Insert the image above where you show the extra borrowed bit extending the network portion.

### Capacity of each /25 subnet

With 7 host bits remaining:

- total addresses per subnet = `2^7 = 128`
- usable addresses per subnet = `128 - 2 = 126`

[[IMAGE: p34_two_subnets_allocation_overview.png]]

Insert the image above where you explain the two resulting `/25` subnets and their ranges.

### Final allocation

| Subnet | Network address | First host | Last host | Broadcast | Mask |
|---|---|---|---|---|---|
| 0 | `192.168.1.0` | `192.168.1.1` | `192.168.1.126` | `192.168.1.127` | `/25` |
| 1 | `192.168.1.128` | `192.168.1.129` | `192.168.1.254` | `192.168.1.255` | `/25` |

[[IMAGE: p39_subnets_in_use_192_168_1_0_25.jpeg]]

Insert the image above where you explain that all host bits equal to 0 gives the network address, and all host bits equal to 1 gives the broadcast address.

## Worked example: divide 192.168.1.0/24 into 4 subnets

To create **4 subnets**, borrow **2 bits** from the host portion:

- `2^2 = 4` subnets

That produces:

- new prefix length: `/26`
- mask: `255.255.255.192`

### Capacity of each /26 subnet

Remaining host bits: `6`

- total addresses = `2^6 = 64`
- usable = `64 - 2 = 62`

### Magic number

For `255.255.255.192`:

- interesting octet = `192`
- magic number = `256 - 192 = 64`

### Resulting subnet table

| Subnet | Network address | First host | Last host | Broadcast | Mask |
|---|---|---|---|---|---|
| 0 | `192.168.1.0` | `192.168.1.1` | `192.168.1.62` | `192.168.1.63` | `/26` |
| 1 | `192.168.1.64` | `192.168.1.65` | `192.168.1.126` | `192.168.1.127` | `/26` |
| 2 | `192.168.1.128` | `192.168.1.129` | `192.168.1.190` | `192.168.1.191` | `/26` |
| 3 | `192.168.1.192` | `192.168.1.193` | `192.168.1.254` | `192.168.1.255` | `/26` |

Notice that the network addresses increase by 64 each time because the magic number is 64.

## Worked example: subnetting 172.25.0.0/16 for at least 11 subnets with about 3000 hosts each

Start with a `/16` network.

### Step 1: satisfy host requirement

Each subnet must support around 3000 hosts.

Find the smallest power of two greater than 3000:

- `2^11 = 2048`, too small
- `2^12 = 4096`, sufficient

So each subnet needs **12 host bits**.

### Step 2: determine the new prefix

A 32-bit address with 12 host bits leaves:

- `32 - 12 = 20` network bits

So the new subnet mask is:

- `/20`
- `255.255.240.0`

### Step 3: determine how many subnet bits were borrowed

Original prefix: `/16`  
New prefix: `/20`

Borrowed bits: `4`

That gives:

- `2^4 = 16` subnets

Sixteen is enough to satisfy a requirement for at least eleven subnetworks.

### Step 4: calculate the magic number

For `255.255.240.0`:

- interesting octet = third octet = `240`
- magic number = `256 - 240 = 16`

So each new subnet starts 16 higher in the third octet.

### Sample allocation pattern

| Subnet | Network address | First host | Last host | Broadcast | Mask |
|---|---|---|---|---|---|
| 0 | `172.25.0.0` | `172.25.0.1` | `172.25.15.254` | `172.25.15.255` | `/20` |
| 1 | `172.25.16.0` | `172.25.16.1` | `172.25.31.254` | `172.25.31.255` | `/20` |
| 2 | `172.25.32.0` | `172.25.32.1` | `172.25.47.254` | `172.25.47.255` | `/20` |
| 3 | `172.25.48.0` | `172.25.48.1` | `172.25.63.254` | `172.25.63.255` | `/20` |

The pattern continues by adding 16 in the third octet.

[[IMAGE: p48_magic_number_progression_172_25_0_0_20.jpeg]]

Insert the image above where you explain how the network addresses step through the third octet in jumps of 16.

## Classless allocation with different network sizes

Sometimes an address block must be split into subnetworks of different sizes. This is where **classless allocation** is especially useful.

Suppose a `/26` block must support three separate networks needing 32, 16, and 16 addresses.

A practical split is:

- one `/27` subnet for the 32-address requirement
- two `/28` subnets for the 16-address requirements

Using the illustrated allocation:

| Subnet | Network address | Usable host range | Broadcast | Mask |
|---|---|---|---|---|
| Subnet 1 | `17.12.14.0` | `17.12.14.1` to `17.12.14.30` | `17.12.14.31` | `/27` |
| Subnet 2 | `17.12.14.32` | `17.12.14.33` to `17.12.14.46` | `17.12.14.47` | `/28` |
| Subnet 3 | `17.12.14.48` | `17.12.14.49` to `17.12.14.62` | `17.12.14.63` | `/28` |

This works because:

- `/27` provides 32 total addresses
- `/28` provides 16 total addresses
- the combined allocation still fits inside the original `/26` range

[[IMAGE: p53_classless_address_allocation_example.png]]

Insert the image above where you explain how one larger subnet and two smaller subnets can coexist inside one parent block.

## VLSM: Variable Length Subnet Masking

VLSM is the practice of assigning **different prefix lengths** to different subnets depending on their needs. It avoids wasting addresses.

### Example requirement

Given `192.168.1.0/24`, allocate addresses for:

| Subnet | Hosts needed |
|---|---:|
| A | 50 |
| B | 100 |
| C | 10 |
| D | 25 |

### Step 1: sort from largest to smallest

Always allocate the biggest subnet first.

| Subnet | Hosts needed | Minimum usable needed | Best-fit subnet size | CIDR |
|---|---:|---:|---:|---|
| B | 100 | 102 total | 128 addresses | `/25` |
| A | 50 | 52 total | 64 addresses | `/26` |
| D | 25 | 27 total | 32 addresses | `/27` |
| C | 10 | 12 total | 16 addresses | `/28` |

### Step 2: allocate from the start of the block

1. **B** gets `192.168.1.0/25`
2. **A** gets `192.168.1.128/26`
3. **D** gets `192.168.1.192/27`
4. **C** gets `192.168.1.224/28`

### Final correct VLSM table

| Subnet | Network address | First host | Last host | Broadcast | Mask |
|---|---|---|---|---|---|
| B | `192.168.1.0` | `192.168.1.1` | `192.168.1.126` | `192.168.1.127` | `/25` |
| A | `192.168.1.128` | `192.168.1.129` | `192.168.1.190` | `192.168.1.191` | `/26` |
| D | `192.168.1.192` | `192.168.1.193` | `192.168.1.222` | `192.168.1.223` | `/27` |
| C | `192.168.1.224` | `192.168.1.225` | `192.168.1.238` | `192.168.1.239` | `/28` |

### Unused space

After these allocations, the range:

- `192.168.1.240` to `192.168.1.255`

remains available as another `/28` block.

### Why VLSM is powerful

Without VLSM, every subnet would have to use the same mask, which would waste a large number of addresses. VLSM lets you match subnet size to actual demand.

## Example routed topology and routing table output

The final slides show a small topology with two routers connecting multiple `/24` LANs through a `/30` WAN link. The routing table output on the router shows directly connected networks, local interface routes, and dynamically learned remote routes.

[[IMAGE: p61_example_ip_routing_table_topology.png]]

Insert the image above where you explain how network numbers map onto interfaces before reading a routing table.

A few things to notice in that example:

- Directly connected routes are marked as connected.
- Each router interface also appears as a local host route.
- Remote networks are reached through the serial next hop.
- Routing tables can hold multiple subnets from the same larger address family.

## A repeatable manual subnetting process

Use this workflow in exams or practical exercises:

1. Write down the original block and its prefix.
2. Determine the number of hosts or subnets needed.
3. Convert that requirement into the smallest suitable power of two.
4. Determine the new prefix length.
5. Convert the prefix to dotted-decimal if needed.
6. Find the magic number.
7. Generate subnet network addresses by repeatedly adding the magic number.
8. For each subnet:
   - first address = network address
   - last address = broadcast address
   - usable range = everything in between
9. If using VLSM, sort from largest subnet to smallest before allocating.

## Common mistakes

### Forgetting the reserved addresses

Do not count the network and broadcast addresses as usable ordinary host addresses.

### Borrowing too few bits

You may create enough subnets but not enough hosts per subnet, or the reverse. Always check both constraints.

### Adding the magic number to the wrong octet

The magic number only increments the octet from which it was derived.

### Not sorting in VLSM

If you allocate small subnetworks first, you can block yourself from fitting the larger subnetworks cleanly later.

### Mixing total addresses and usable hosts

A `/28` has 16 total addresses, but only 14 usable host addresses in traditional IPv4 subnetting.

## Summary

IPv4 addressing is built around the idea that routers mainly move packets toward networks, while the final delivery depends on the host part of the address. Classful addressing introduced fixed categories, but it wasted address space and did not scale well. Classless addressing, subnet masks, CIDR, subnetting, and VLSM made address allocation far more flexible and efficient.

### High-value takeaways

- Every IP address is 32 bits long in IPv4.
- The prefix identifies the network and the suffix identifies the host or interface.
- Routers make forwarding decisions using destination prefixes.
- A subnet mask defines exactly where the network portion ends.
- Applying the mask to any host address in a subnet gives the subnet's network address.
- The network address has all host bits set to `0`.
- The broadcast address has all host bits set to `1`.
- Borrowing host bits increases the number of subnets.
- Borrowing host bits decreases the number of hosts per subnet.
- The magic number is `256 - interesting_octet`.
- VLSM allocates the largest required networks first to minimise waste.

### Quick self-check questions

1. Why does borrowing 2 bits create 4 subnets?
2. What is the magic number for `255.255.255.224`?
3. What are the network and broadcast addresses of `192.168.10.64/26`?
4. Why is VLSM better than forcing one mask on all subnets?
5. In a `/20` subnet, which octet usually changes when listing consecutive subnet network addresses?
