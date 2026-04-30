# Algorithms and Data Structures: Comprehensive Exam Study Material

---

# 1. Heaps

## 1.1 What is a heap?

A binary heap is a complete binary tree stored inside an array.

For a max heap:

- The largest key is at the root.
- Every parent is greater than or equal to its children.
- The tree is complete, meaning every level is full except possibly the last, filled from left to right.

For an array `a[]`, using zero based indexing:

```text
parent(i) = (i - 1) / 2
left(i) = 2i + 1
right(i) = 2i + 2
```

Example heap array:

```text
index: 0 1 2 3 4 5 6 7
value: 12 11 8 10 7 5 1 9
```

Tree form:

```text
 12
 / \
 11 8
 / \ / \
 10 7 5 1
 /
 9
```

## 1.2 Heap array vs sorted array

A heap array is not fully sorted. It only guarantees that each parent has priority over its children.

A sorted array is globally ordered. Every element is in exact sorted position.

Example:

```text
Heap: [12, 11, 8, 10, 7, 5, 1, 9]
Sorted desc: [12, 11, 10, 9, 8, 7, 5, 1]
```

Both have 12 first, but the heap is not fully sorted.

## 1.3 Heap vs unsorted array vs sorted array

For a priority queue:

| Structure | insert | remove max/min | Why |
|---|---:|---:|---|
| Unsorted array | O(1) | O(n) | Insert at end, but removal must search all items |
| Sorted array | O(n) | O(1) | Removal is easy, but insertion must shift items |
| Binary heap | O(log n) | O(log n) | Both operations only move up or down the tree height |

The heap is better when both insertion and removal happen repeatedly.

## 1.4 Insert into a max heap

To insert:

1. Put the new key in the next free array position.
2. Compare it with its parent.
3. If it is bigger than the parent, swap.
4. Continue until the heap property is restored.

Example, insert 13:

```text
Start:
[12, 11, 8, 10, 7, 5, 1, 9]

Append 13:
[12, 11, 8, 10, 7, 5, 1, 9, 13]
```

13 is at index 8. Its parent is index 3, value 10.

```text
Swap 13 and 10:
[12, 11, 8, 13, 7, 5, 1, 9, 10]
```

13 is now at index 3. Its parent is index 1, value 11.

```text
Swap 13 and 11:
[12, 13, 8, 11, 7, 5, 1, 9, 10]
```

13 is now at index 1. Its parent is index 0, value 12.

```text
Swap 13 and 12:
[13, 12, 8, 11, 7, 5, 1, 9, 10]
```

Final heap:

```text
 13
 / \
 12 8
 / \ / \
 11 7 5 1
 / \
 9 10
```

## 1.5 hPos array

An `hPos[]` array stores where each key currently appears in the heap.

For:

```text
index: 0 1 2 3 4 5 6 7
value: 12 11 8 10 7 5 1 9
```

The mapping is:

```text
hPos[12] = 0
hPos[11] = 1
hPos[8] = 2
hPos[10] = 3
hPos[7] = 4
hPos[5] = 5
hPos[1] = 6
hPos[9] = 7
```

It is useful when a graph algorithm needs to quickly find the heap position of a vertex.

## 1.6 Recursive maxHeapify

`maxHeapify(k)` assumes the left and right subtrees are already valid heaps, but the node at `k` might violate the heap property.

```text
maxHeapify(k):
 left = 2*k + 1
 right = 2*k + 2
 largest = k

 if left < heapSize and a[left] > a[largest]:
 largest = left

 if right < heapSize and a[right] > a[largest]:
 largest = right

 if largest != k:
 swap a[k] and a[largest]
 maxHeapify(largest)
```

Complexity: `O(log n)`, because the element moves down at most one tree height.

## 1.7 Selection sort and heap sort as hard split, easy join

A hard split, easy join algorithm does most of its work before the final output is produced.

Selection sort:

- Hard part: repeatedly find the minimum or maximum.
- Easy part: place it into the correct position.

Heap sort:

- Hard part: build and maintain the heap.
- Easy part: repeatedly remove the root and place it at the end.

They are similar because both repeatedly select the next largest or smallest item. Heap sort improves the selection step by using a heap, so finding the next item does not require scanning the entire remaining array.

---

# 2. Sorting Algorithms

## 2.1 Bubble sort

Bubble sort compares adjacent elements and swaps them if they are in the wrong order.

For ascending order:

```text
bubbleSort(a):
 for pass = 0 to n - 2:
 for i = 0 to n - 2 - pass:
 if a[i] > a[i + 1]:
 swap a[i], a[i + 1]
```

Complexity:

- Worst case: `O(n^2)`
- Average case: `O(n^2)`
- Best case with early stop: `O(n)`
- Best case without early stop: `O(n^2)`

Main flaw:

Bubble sort only moves elements one position at a time. A very small element near the right side takes many passes to reach the left. These are sometimes called turtles.

## 2.2 First two bubble sort passes on the exam array

Array:

```text
6 3 1 9 8 2 4 7 0 5
```

After pass 1:

```text
3 1 6 8 2 4 7 0 5 9
```

After pass 2:

```text
1 3 6 2 4 7 0 5 8 9
```

Notice that `0` is still far from the front after two full passes. That shows the weakness of bubble sort.

## 2.3 Comb sort

Comb sort improves bubble sort by comparing elements far apart at first.

Instead of only comparing `a[i]` and `a[i+1]`, it compares:

```text
a[i] and a[i + gap]
```

The gap starts large and shrinks, often by about 1.3, until it becomes 1. Once gap is 1, the algorithm has become bubble sort.

Why it improves bubble sort:

- Small values far to the right can move left quickly.
- Large values far to the left can move right quickly.
- It reduces the turtle problem.

Example gaps for array length 10 using shrink factor 1.3:

```text
10 -> 7 -> 5 -> 3 -> 2 -> 1
```

## 2.4 Quick sort

Quick sort:

1. Choose a pivot.
2. Partition the array so smaller values are on one side and larger values are on the other.
3. Recursively quick sort the left and right subarrays.

Basic pseudocode:

```text
quickSort(a, low, high):
 if low < high:
 p = partition(a, low, high)
 quickSort(a, low, p - 1)
 quickSort(a, p + 1, high)
```

Complexity:

| Case | Complexity |
|---|---:|
| Best | O(n log n) |
| Average | O(n log n) |
| Worst | O(n^2) |

Worst case happens when partitions are extremely unbalanced, for example choosing the first element as pivot on an already sorted array.

Example:

```text
1 2 3 4 5 6 7
```

If the first element is always pivot, each partition gives one empty side and one side of size `n - 1`.

## 2.5 Heap sort complexity

Heap sort has two phases:

1. Build heap: `O(n)`
2. Remove root `n` times, each removal costs `O(log n)`: `O(n log n)`

Total:

```text
O(n) + O(n log n) = O(n log n)
```

Heap sort is better than bubble sort because bubble sort is `O(n^2)`. Heap sort also has a guaranteed `O(n log n)` worst case, while quick sort can fall to `O(n^2)` in the worst case. Quick sort is often faster in practice on average, but heap sort has the stronger worst case guarantee.

---

# 3. Graph Representation

## 3.1 Adjacency matrix

An adjacency matrix is a two dimensional array.

For a weighted graph:

```text
matrix[u][v] = weight of edge u to v
matrix[u][v] = infinity or 0 if no edge exists
```

Advantages:

- Checking whether an edge exists is `O(1)`.
- Good for dense graphs.
- Simple structure.

Disadvantages:

- Uses `O(V^2)` memory even if there are few edges.
- Wasteful for sparse graphs.

## 3.2 Adjacency list

An adjacency list stores, for each vertex, the list of neighbouring vertices and weights.

Example:

```text
A: (B,7), (D,5)
B: (A,7), (C,8), (D,9), (E,7)
C: (B,8), (E,5)
D: (A,5), (B,9), (E,15), (F,6)
E: (B,7), (C,5), (D,15), (F,8), (G,9)
F: (D,6), (E,8), (G,11)
G: (E,9), (F,11)
```

Advantages:

- Uses `O(V + E)` memory.
- Better for sparse graphs.
- Graph algorithms like DFS, BFS, Dijkstra, and Prim naturally scan adjacency lists.

Disadvantages:

- Checking whether a specific edge exists may take longer because the list must be searched.

---

# 4. Depth First Search

## 4.1 Purpose

DFS explores as far as possible down one branch before backtracking.

It records:

- `color`
 - WHITE means undiscovered.
 - GRAY means discovered but not finished.
 - BLACK means finished.
- `d`
 - discovery time.
- `f`
 - finishing time.
- `π`
 - parent in the DFS tree.

## 4.2 DFS pseudocode

```text
DFS(G):
 for each vertex u in G.V:
 u.color = WHITE
 u.parent = NIL

 time = 0

 for each vertex u in G.V:
 if u.color == WHITE:
 DFSVisit(G, u)

DFSVisit(G, u):
 time = time + 1
 u.d = time
 u.color = GRAY

 for each vertex v in G.Adj[u]:
 if v.color == WHITE:
 v.parent = u
 DFSVisit(G, v)

 u.color = BLACK
 time = time + 1
 u.f = time
```

## 4.3 DFS complexity

Using adjacency lists:

```text
O(V + E)
```

Reason:

- The outer loop visits each vertex once: `O(V)`.
- Each adjacency list is scanned once overall: `O(E)`.
- Total: `O(V + E)`.

For a connected graph, all vertices are reached from the first start vertex, but the complexity is still `O(V + E)` because all vertices and edges are still considered.

---

# 5. Dijkstra's Shortest Path Tree Algorithm

## 5.1 Purpose

Dijkstra finds the shortest path distance from a source vertex to every other vertex in a graph with non negative edge weights.

It builds a shortest path tree using:

- `distance[]`: best known distance from source.
- `parent[]`: previous vertex on the best known path.
- a min priority queue or heap.

## 5.2 Dijkstra pseudocode

```text
Dijkstra(G, source):
 for each vertex v in G.V:
 distance[v] = infinity
 parent[v] = NIL

 distance[source] = 0
 heap = all vertices keyed by distance

 while heap is not empty:
 u = removeMin(heap)

 for each edge (u, v) in G.Adj[u]:
 if v is still in heap and distance[u] + weight(u, v) < distance[v]:
 distance[v] = distance[u] + weight(u, v)
 parent[v] = u
 decreaseKey(heap, v, distance[v])
```

## 5.3 Complexity for sparse graph

With adjacency lists and a binary heap:

```text
O((V + E) log V)
```

For a sparse graph, `E` is close to `V`, so this is often written as:

```text
O(E log V)
```

The heap operations dominate because each vertex is removed from the heap and edge relaxations can cause decrease key operations.

## 5.4 Dijkstra vs Prim

Dijkstra updates a neighbour using full path distance:

```text
distance[v] = distance[u] + weight(u, v)
```

Prim updates a neighbour using only the edge weight:

```text
distance[v] = weight(u, v)
```

That one change turns Dijkstra's shortest path tree algorithm into Prim's minimum spanning tree algorithm.

---

# 6. Prim's Minimum Spanning Tree Algorithm

## 6.1 Purpose

Prim builds a minimum spanning tree by growing one tree from a starting vertex.

It repeatedly selects the cheapest edge that connects a vertex inside the tree to a vertex outside the tree.

## 6.2 Prim pseudocode

```text
Prim(G, start):
 for each vertex v:
 dist[v] = infinity
 parent[v] = NIL

 dist[start] = 0
 heap = all vertices keyed by dist

 while heap is not empty:
 u = removeMin(heap)

 for each edge (u, v) in G.Adj[u]:
 if v is in heap and weight(u, v) < dist[v]:
 dist[v] = weight(u, v)
 parent[v] = u
 decreaseKey(heap, v, dist[v])
```

## 6.3 Prim vs Dijkstra

Prim cares about the cheapest edge into the tree.

Dijkstra cares about the cheapest total path from the source.

This is why they may create different trees even on the same graph.

---

# 7. Kruskal's Algorithm and UnionFind

## 7.1 Kruskal's algorithm

Kruskal builds a minimum spanning tree by sorting all edges by weight.

Steps:

1. Sort all edges from smallest to largest.
2. Start with every vertex in its own set.
3. For each edge `(u, v)`:
 - if `u` and `v` are in different sets, add the edge.
 - union their sets.
 - if they are already in the same set, reject the edge because it creates a cycle.

## 7.2 Purpose of UnionFind

UnionFind is used to track connected components while Kruskal is running.

It answers two questions quickly:

```text
findSet(x): which component is x in?
union(a, b): merge two components
```

In Kruskal:

- If `findSet(u) == findSet(v)`, adding the edge creates a cycle.
- If `findSet(u) != findSet(v)`, the edge is safe to add.

## 7.3 UnionFind representations

### List based representation

Each set is stored as a list.

- `findSet`: can be `O(1)` if each item stores a set label.
- `union`: can be expensive, often `O(n)`, because labels must be updated.

### Tree based representation

Each item points to a parent. The root represents the set.

- `findSet`: follow parent links to the root.
- `union`: make one root point to another root.

With union by rank and path compression, operations become almost constant in practice.

## 7.4 Path compression

Path compression makes every node on a find path point directly to the root.

Example:

```text
E -> D -> B -> C
```

After `findSet(E)` with path compression:

```text
E -> C
D -> C
B -> C
```

This makes future `findSet` operations faster.

---

# 8. Binary Search

## 8.1 Requirement

Binary search only works on a sorted array.

## 8.2 Idea

It repeatedly checks the middle item:

- If target equals middle, found.
- If target is smaller, search left half.
- If target is larger, search right half.

## 8.3 Complexity

```text
O(log n)
```

Each comparison halves the remaining search space.

## 8.4 Binary search pseudocode

```text
binarySearch(a, target):
 low = 0
 high = length(a) - 1

 while low <= high:
 mid = (low + high) / 2

 if a[mid] == target:
 return mid
 else if target < a[mid]:
 high = mid - 1
 else:
 low = mid + 1

 return NOT_FOUND
```

---

# 9. Binary Search Trees

## 9.1 Definition

A binary search tree is a binary tree where:

- every value in the left subtree is smaller than the node,
- every value in the right subtree is larger than the node,
- this property is true for every node.

## 9.2 BST search

```text
BSTSearch(root, key):
 current = root

 while current != NIL and current.key != key:
 if key < current.key:
 current = current.left
 else:
 current = current.right

 return current
```

## 9.3 Complexity

The complexity depends on tree height `h`.

```text
O(h)
```

For a balanced tree:

```text
O(log n)
```

For a badly unbalanced tree:

```text
O(n)
```

Bad example:

```text
1
 \
 2
 \
 3
 \
 4
```

This behaves like a linked list.

---

# 10. AVL Trees

## 10.1 Definition

An AVL tree is a self balancing binary search tree.

For every node:

```text
balance factor = height(left subtree) - height(right subtree)
```

Allowed balance factors:

```text
-1, 0, +1
```

If a node becomes `-2` or `+2`, the tree must be rebalanced.

## 10.2 Rotations

A rotation is a local restructuring operation that restores balance while keeping the BST ordering valid.

Four cases:

| Case | Problem shape | Fix |
|---|---|---|
| Left Left | heavy on left child's left | right rotation |
| Right Right | heavy on right child's right | left rotation |
| Left Right | heavy on left child's right | left rotation then right rotation |
| Right Left | heavy on right child's left | right rotation then left rotation |

## 10.3 Inserting 54 into the exam BST

Starting tree:

```text
 44
 / \
 17 78
 \ / \
 32 50 88
 / \
 48 62
```

Insert 54:

- 54 > 44, go right to 78.
- 54 < 78, go left to 50.
- 54 > 50, go right to 62.
- 54 < 62, insert as left child of 62.

Tree after normal BST insertion:

```text
 44
 / \
 17 78
 \ / \
 32 50 88
 / \
 48 62
 /
 54
```

Now node 78 becomes left heavy, and its left child 50 is right heavy. That is a Left Right case at 78.

Fix:

1. Left rotate at 50.
2. Right rotate at 78.

Balanced result:

```text
 44
 / \
 17 62
 \ / \
 32 50 78
 / \ \
 48 54 88
```

---

# 11. Exam strategy

## 11.1 Most likely high value areas

Study these first:

1. Heap array, heap insertion, heapify, heap sort.
2. Bubble sort, comb sort, quick sort partitioning, complexity.
3. DFS timings and complexity.
4. Dijkstra table with heap, distance, and parent arrays.
5. BST insertion and AVL rotations.
6. UnionFind and Kruskal, because it appeared twice and could return.

## 11.2 How to score well

For algorithm trace questions:

- Show the array or table after every important step.
- Label the chosen vertex, pivot, heap root, or inserted node.
- Always include parent and distance arrays for graph algorithms.
- For complexity questions, do not just write the final Big O. Explain where it comes from.
- For tree questions, draw before and after diagrams.

## 11.3 Common mistakes that lose marks

- Saying a heap array is sorted. It is not.
- Forgetting that heap insert bubbles up, while heapify usually sifts down.
- Writing Dijkstra's update rule as just the edge weight. That is Prim, not Dijkstra.
- Writing Prim's update rule as full path distance. That is Dijkstra, not Prim.
- Claiming quick sort is always `O(n log n)`. Worst case is `O(n^2)`.
- Claiming BST search is always `O(log n)`. It is only `O(log n)` when balanced.
- Forgetting path compression changes intermediate parent pointers, not just the root.
