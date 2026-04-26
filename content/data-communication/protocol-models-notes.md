# Protocol Models

## Overview

Protocol models are conceptual frameworks used to explain how communication happens across computer networks. A real network is made up of many hardware components, software modules, interfaces, and transmission media. A protocol model gives structure to that complexity by separating the communication problem into layers, where each layer handles a specific responsibility.

These notes explain why layered protocol models are needed, the meaning of key networking terms, the logic of the ISO OSI reference model, and how information moves through the layers during communication.

## Why a Simple Hardware View Is Not Enough

A basic hardware-oriented communication model can show major components such as source, transmitter, transmission system, receiver, and destination. That view is useful for seeing the physical path of communication, but it does not fully explain how modern networks work.

In practice, communication tasks are divided across both hardware and software. For example:

- an IP datagram may be handled partly by operating system software
- MAC frames may be created and interpreted by network interface hardware and drivers
- physical transmission depends on the encoding of bits onto a cable or wireless medium
- the same host may support multiple network technologies at once

Because these tasks are distributed across different components, a better model is needed to describe *functions* rather than just physical devices.

## The Layered Approach

To manage complexity, networking systems are organized into layers of protocol software. Each layer performs one part of the overall communication job.

A layer:

- provides services to the layer above it
- uses the services of the layer below it
- hides its internal details from other layers

This is similar to software engineering, where a library or object performs a task internally and exposes only the service interface needed by the rest of the program.

The layered approach makes network design easier because each layer can be studied, designed, standardized, and implemented with a clear responsibility.

## Key Terminology

### Protocol or Protocol Entity
A protocol entity is a software module that performs a specific communication sub-task, such as frame transmission, routing, or reliable delivery.

### Protocol Stack or Protocol Suite
A protocol stack is a collection of protocol layers that work together to provide complete communication between hosts.

### Protocol Architecture or Protocol Model
A protocol model is the conceptual structure used to organize and classify protocol layers.

## Why Layering Helps

Layering provides several practical benefits:

- **Abstraction**: each layer focuses on a specific job
- **Modularity**: parts of the system can be changed without redesigning everything
- **Standardization**: vendors can build interoperable systems
- **Troubleshooting clarity**: problems can often be isolated to a specific layer
- **Scalability**: complex network systems become easier to reason about

## The CEO-Translator-Secretary Analogy

The slide deck uses a communication analogy involving a CEO, a translator, and a secretary. The point of the analogy is that successful communication often requires several cooperating roles, not just two people talking directly.

In that analogy:

- the **CEO** represents the high-level meaning of the message
- the **translator** converts the message into a form the remote side can understand
- the **secretary** prepares the information for transmission using the specific delivery mechanism

Each level communicates logically with its peer on the remote side, even though the actual message physically moves downward through the local layers and upward through the remote layers.

This is a strong analogy for protocol layers, where each layer has a corresponding peer layer on the other host.

[[IMAGE: ceo_translator_secretary_architecture.png]]

## The ISO OSI Reference Model

The OSI model is a seven-layer reference model developed to describe communication between open systems. An open system is one that is designed to communicate with other systems regardless of manufacturer or implementation.

The main design principles behind the model are:

- each layer exists because a separate level of abstraction is needed
- each layer performs a clearly defined function
- the functions were chosen to support standard protocols
- the number of layers was selected so that distinct responsibilities are not mixed together unnecessarily

The OSI model is not just a list of layers. It is a way of thinking about network communication as a structured set of services and responsibilities.

[[IMAGE: iso_osi_reference_model.png]]

## The Seven OSI Layers at a Glance

From top to bottom, the OSI layers are:

- Application
- Presentation
- Session
- Transport
- Network
- Data Link
- Physical

A common way to remember them in practice is to think from the user's intent at the top down to actual signal transmission at the bottom.

## Layer-by-Layer Explanation

### Application Layer

The Application layer is the layer closest to the user and to application software. It provides network services to user-facing programs.

Examples of responsibilities include:

- supporting user services such as file transfer, email, remote access, or web access
- providing the interface through which applications request communication
- defining application-level protocols and message formats

This layer is about *what the application wants to do* over the network.

### Presentation Layer

The Presentation layer is concerned with the representation of data. Its purpose is to make sure that information sent by one system can be correctly understood by another.

Typical concerns include:

- data format translation
- character encoding
- encryption and decryption
- compression and decompression

This layer answers the question: *In what form should the data be represented so that both systems understand it?*

### Session Layer

The Session layer manages dialogs or sessions between communicating systems.

Typical responsibilities include:

- session establishment
- session maintenance
- session termination
- dialog control, such as deciding which side transmits at a given moment
- synchronization and recovery support

This layer is about organizing and controlling the conversation between hosts.

### Transport Layer

The Transport layer is a major layer because it provides end-to-end delivery between processes running on end hosts. It is responsible for process-to-process communication rather than just host-to-host communication.

The slides emphasize that this layer:

- provides reliable data transport to applications
- interfaces with applications for data exchange
- deals with multiplexing multiple data streams
- handles issues such as data loss and network latency

In simple terms, the Transport layer makes communication useful and dependable for applications.

### Network Layer

The Network layer is responsible for delivery across complex interconnected networks. Its role is host-to-host delivery over potentially many sub-networks.

The slides describe it as being concerned with:

- routing packets from source toward destination
- operating across subnets
- supporting a globally unique address space
- supporting communication across interconnected heterogeneous networks

This is the layer where logical addressing and routing decisions become central.

### Data Link Layer

The Data Link layer is responsible for successful transmission across a single link. Its goal is to make the underlying physical link appear reliable to the Network layer.

The slides identify the following responsibilities:

- framing
- local addressing
- flow control
- error control
- controlling access to a shared medium

This layer deals with frames rather than packets, and it focuses on communication over one local connection at a time.

### Physical Layer

The Physical layer is responsible for transmitting raw bits over the communication channel.

The slides emphasize that it deals with issues such as:

- voltage levels
- frequencies
- bit duration
- physical medium characteristics
- mechanical and electrical design of interfaces, plugs, and sockets

This layer is not concerned with meaning. It is concerned with physically sending 1s and 0s.

## Relationship Between the Layers

The layers do not operate independently. They work together as a stack.

A higher layer requests a service from the layer below it. The lower layer performs that service and may add its own control information. At the receiving side, the reverse happens. Each layer removes or interprets the control information relevant to it and passes the remaining data upward.

This structure means:

- upper layers focus more on application meaning and end-to-end behavior
- lower layers focus more on local delivery and physical transmission

## Encapsulation and Information Flow

When data moves down a protocol stack, each lower layer adds control information to help the corresponding peer layer on the receiver side process it correctly. This process is called **encapsulation**.

A simplified view is:

- Application produces data
- Transport adds its header
- Network adds its header
- Data Link adds its header and trailer
- Physical sends the result as bits

At the receiver, the reverse process happens. Each layer removes its own control information and passes the remaining content upward. This reverse process is sometimes called **decapsulation**.

The slide also shows how different names are used at different layers:

- **Data** at upper layers
- **Packet** at the Network layer
- **Frame** at the Data Link layer
- **Bits** at the Physical layer

[[IMAGE: encapsulation_and_information_flow_on_end_host.png]]

## Interfaces and Peer Communication

One important concept in layered models is that each layer communicates in two different ways:

- **Vertically**, with the layers above and below it on the same machine
- **Logically**, with its peer layer on the remote machine

For example:

- a Transport layer on Host A logically communicates with the Transport layer on Host B
- a Data Link layer on one device communicates with the Data Link layer on the next directly connected device
- a Physical layer sends the actual signals that allow all other layers to function

This is why protocol diagrams often show horizontal peer relationships and vertical service relationships.

## End Hosts Versus Intermediate Devices

Not every device in a network implements all seven layers.

End hosts typically implement the full stack because they originate and consume application data.

Intermediate devices, such as routers, usually implement only the lower layers needed for their role. The slide deck highlights that routers use lower-layer functionality because they must:

- receive and transmit frames
- process packets
- route traffic onward

They do not normally run the remote user's application, presentation, or session logic for forwarded traffic.

## Layers 1 to 3 Versus Layers 4 to 7

A useful distinction is the difference between the lower layers and the upper layers:

### Lower layers: Physical, Data Link, Network
These layers are more concerned with moving data through the network infrastructure itself. Their work involves signals, links, frames, packets, and routing.

### Upper layers: Transport, Session, Presentation, Application
These layers are more concerned with end-to-end service, application meaning, and the interaction between processes and users.

The final slide shows that:

- the full stack exists on end hosts
- routers participate mainly in the lower layers
- end-to-end communication at the upper layers is between the two hosts, not through the routers

[[IMAGE: osi_layers_1_3_vs_layers_4_7.png]]

## Core Ideas to Remember

- A protocol model explains communication by *function*, not just by hardware layout.
- Layering divides the communication problem into manageable pieces.
- Each layer provides services to the layer above and uses services from the layer below.
- The OSI model organizes communication into seven layers, from applications at the top to raw bit transmission at the bottom.
- Lower layers focus on moving data through the network. Upper layers focus on end-to-end communication and application meaning.
- Encapsulation is the process by which each layer adds control information as data moves downward through the stack.
- Routers usually operate on the lower layers because their role is forwarding and routing rather than running the end-user application.

## Exam-Focused Summary

If you need a compact revision view, focus on these points:

- **Physical layer**: sends raw bits over the medium  
- **Data Link layer**: frames, local delivery, MAC addressing, error and flow control  
- **Network layer**: packets, routing, host-to-host delivery across interconnected networks  
- **Transport layer**: reliable end-to-end process communication  
- **Session layer**: manages conversations between systems  
- **Presentation layer**: handles representation, translation, encryption, compression  
- **Application layer**: provides services to user applications  

Also remember:

- protocol stacks are layered software systems
- peer layers communicate logically
- adjacent layers communicate through service interfaces
- encapsulation and decapsulation explain how data moves through the stack

## Quick Self-Test Questions

1. Why is a simple hardware communication model not enough to explain networking?
2. What is the main purpose of layering in network design?
3. What is the difference between a protocol entity, a protocol stack, and a protocol architecture?
4. Why is the Transport layer considered an end-to-end layer?
5. What is the difference between the Data Link layer and the Network layer?
6. What happens during encapsulation?
7. Why do routers mainly use the lower layers of the OSI model?
8. What kinds of responsibilities belong to the Presentation layer?
9. How does the Session layer differ from the Application layer?
10. Why is abstraction important in protocol models?
