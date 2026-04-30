# CMPU2001 Expected Exam Questions and Model Answers

These are based on the repeated structure across the past papers. They are not a leak or guarantee. They are the highest value questions to practise.

---

# Question 1

Question: What is the difference between a heap array and a sorted array?

Answer:

A heap array is not fully sorted. It only satisfies the heap property. In a max heap, every parent is greater than or equal to its children. A sorted array has a complete global order where every element is in exact sorted position.

Example:

```text
Heap:   [12, 11, 8, 10, 7, 5, 1, 9]
Sorted: [12, 11, 10, 9, 8, 7, 5, 1]
```

The heap is useful because it allows efficient priority queue operations without fully sorting the array.

---

Question: Compare insert and remove operations in an unsorted array, sorted array, and binary heap.

Answer:

| Structure | insert | remove max/min |
|---|---:|---:|
| Unsorted array | O(1) | O(n) |
| Sorted array | O(n) | O(1) |
| Binary heap | O(log n) | O(log n) |

A binary heap is the best compromise when both insertions and removals are frequent.

---

Question: Draw the heap array `[12, 11, 8, 10, 7, 5, 1, 9]` as a binary tree.

Answer:

```text
              12
           /      \
         11        8
       /   \      / \
     10     7    5   1
    /
   9
```

This is valid because every parent is greater than its children.

---

Question: Insert 13 into the heap `[12, 11, 8, 10, 7, 5, 1, 9]`.

Answer:

Append 13:

```text
[12, 11, 8, 10, 7, 5, 1, 9, 13]
```

Swap with 10:

```text
[12, 11, 8, 13, 7, 5, 1, 9, 10]
```

Swap with 11:

```text
[12, 13, 8, 11, 7, 5, 1, 9, 10]
```

Swap with 12:

```text
[13, 12, 8, 11, 7, 5, 1, 9, 10]
```

Final heap:

```text
              13
           /      \
         12        8
       /   \      / \
     11     7    5   1
    /  \
   9    10
```

---

Question: Write recursive `maxHeapify(k)`.

Answer:

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

Complexity is `O(log n)` because the node can move down at most the height of the heap.

---

Question: Why are selection sort and heap sort both hard split, easy join?

Answer:

Both algorithms repeatedly select the next item that belongs in the final sorted output.

Selection sort does this by scanning the unsorted part every time, which is expensive. Heap sort does this by maintaining a heap, so the next maximum or minimum is always at the root. The difficult work is maintaining the structure. The final join step is easy because selected elements are placed directly into their final positions.

---

# Question 2

Question: Show the first two passes of bubble sort on `6 3 1 9 8 2 4 7 0 5`.

Answer:

Start:

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

The flaw is that `0` is still far from the front after two passes. Bubble sort moves values only one adjacent swap at a time.

---

Question: What is comb sort, and why is it better than bubble sort?

Answer:

Comb sort is an improvement on bubble sort that compares elements separated by a gap. The gap starts large and shrinks until it becomes 1. When the gap becomes 1, comb sort becomes bubble sort.

It is better because it can move small values left and large values right faster than adjacent swaps. This reduces the turtle problem in bubble sort.

---

Question: Apply comb sort to `6 3 1 9 8 2 4 7 0 5` until it becomes bubble sort.

Answer:

Using gap sequence:

```text
7, 5, 3, 2, 1
```

Start:

```text
6 3 1 9 8 2 4 7 0 5
```

After gap 7:

```text
6 0 1 9 8 2 4 7 3 5
```

After gap 5:

```text
2 0 1 3 5 6 4 7 9 8
```

After gap 3:

```text
2 0 1 3 5 6 4 7 9 8
```

After gap 2:

```text
1 0 2 3 4 6 5 7 9 8
```

Gap 1, bubble sort stage:

```text
0 1 2 3 4 5 6 7 8 9
```

---

Question: Show the first two quick sort partitions on `6 3 1 9 8 2 4 7 0 5`, assuming first element pivot.

Answer:

First pivot is 6:

```text
4 3 1 5 0 2 | 6 | 7 8 9
```

Full array:

```text
4 3 1 5 0 2 6 7 8 9
```

Second partition is on the left subarray with pivot 4:

```text
0 3 1 2 | 4 | 5
```

Full array:

```text
0 3 1 2 4 5 6 7 8 9
```

---

Question: Give a worst case example for quick sort and its complexity.

Answer:

If the first element is always chosen as pivot, an already sorted array is a worst case:

```text
1 2 3 4 5 6 7
```

Each partition gives one empty side and one side of size `n - 1`.

Worst case complexity:

```text
O(n^2)
```

---

Question: Explain heap sort complexity and compare it to bubble sort and quick sort.

Answer:

Heap sort builds a heap in `O(n)` and then removes the root `n` times. Each removal costs `O(log n)`.

```text
O(n) + O(n log n) = O(n log n)
```

Bubble sort is `O(n^2)`, so heap sort is better for large arrays.

Quick sort is average `O(n log n)`, but worst case `O(n^2)`. Heap sort has guaranteed `O(n log n)` worst case.

---

# Question 3

Question: Write DFS pseudocode.

Answer:

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

    for each v in G.Adj[u]:
        if v.color == WHITE:
            v.parent = u
            DFSVisit(G, v)

    u.color = BLACK
    time = time + 1
    u.f = time
```

---

Question: What is the complexity of DFS using adjacency lists?

Answer:

DFS is `O(V + E)`.

The algorithm initializes every vertex, so that is `O(V)`. During the traversal, each vertex is discovered once and each adjacency list is scanned once. The total number of adjacency list entries is `E`. Therefore the total complexity is `O(V + E)`.

---

Question: For the standard DFS graph with vertices `u, v, w, x, y, z`, give discovery and finishing times.

Answer:

Using vertex order `u, v, w, x, y, z` and adjacency lists:

```text
u: v, x
v: y
w: y, z
x: v
y: x
z: z
```

Final table:

| Vertex | d | f | parent |
|---|---:|---:|---|
| u | 1 | 8 | NIL |
| v | 2 | 7 | u |
| y | 3 | 6 | v |
| x | 4 | 5 | y |
| w | 9 | 12 | NIL |
| z | 10 | 11 | w |

---

Question: Write Dijkstra's algorithm using adjacency lists.

Answer:

```text
Dijkstra(G, source):
    for each vertex v:
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

---

Question: What is the complexity of Dijkstra for a sparse graph using adjacency lists and a binary heap?

Answer:

The complexity is:

```text
O((V + E) log V)
```

For sparse graphs, `E` is close to `V`, so this is often simplified to:

```text
O(E log V)
```

The reason is that heap operations cost `O(log V)` and edge relaxations may update heap keys.

---

Question: What one line change converts Dijkstra into Prim?

Answer:

Dijkstra relaxes using total path distance:

```text
distance[u] + weight(u, v)
```

Prim uses only the edge weight:

```text
weight(u, v)
```

So change the update test from:

```text
if distance[u] + weight(u, v) < distance[v]
```

to:

```text
if weight(u, v) < distance[v]
```

---

Question: Run Dijkstra from source `G` on the graph with edges `AB7, AD5, BC8, BD9, BE7, CE5, DE15, DF6, EF8, EG9, FG11`.

Answer:

Final distances and parents:

| Vertex | Distance from G | Parent |
|---|---:|---|
| G | 0 | NIL |
| E | 9 | G |
| F | 11 | G |
| C | 14 | E |
| B | 16 | E |
| D | 17 | F |
| A | 22 | D |

Shortest path tree:

```text
G
├── E
│   ├── B
│   └── C
└── F
    └── D
        └── A
```

---

# Question 4

Question: What is the purpose of UnionFind in Kruskal's algorithm?

Answer:

UnionFind keeps track of which vertices are already connected while Kruskal's algorithm builds a minimum spanning tree.

For each edge `(u, v)`:

- If `findSet(u) == findSet(v)`, then `u` and `v` are already connected, so adding the edge would create a cycle.
- If `findSet(u) != findSet(v)`, the edge is safe to add, and the two sets are merged using `union`.

---

Question: Given `treeParent[]` where `A:C, B:C, C:C, D:B, E:D, F:F, G:D, H:K, I:H, J:H, K:K`, draw the set trees.

Answer:

Tree 1 rooted at C:

```text
        C
      / | \
     A  B  C
        |
        D
       / \
      E   G
```

More cleanly, since C points to itself as root:

```text
C
├── A
└── B
    └── D
        ├── E
        └── G
```

Tree 2 rooted at F:

```text
F
```

Tree 3 rooted at K:

```text
K
├── H
│   ├── I
│   └── J
└── K
```

More cleanly, since K points to itself as root:

```text
K
└── H
    ├── I
    └── J
```

---

Question: For the same UnionFind structure, what do `findSet(G)` and `findSet(H)` return?

Answer:

For `G`:

```text
G -> D -> B -> C
```

So:

```text
findSet(G) = C
```

For `H`:

```text
H -> K
```

So:

```text
findSet(H) = K
```

---

Question: What happens after `union(C, K)`?

Answer:

The two sets rooted at C and K are merged. Depending on the implementation, either K becomes child of C or C becomes child of K.

One valid result is:

```text
C
├── A
├── B
│   └── D
│       ├── E
│       └── G
└── K
    └── H
        ├── I
        └── J
```

If the implementation attaches C under K, the drawing is different but still correct if all nodes become part of one set.

---

Question: Show the effect of `findSet(E)` with path compression.

Answer:

Before path compression:

```text
E -> D -> B -> C
```

After `findSet(E)`, all nodes on the path point directly to root C:

```text
E -> C
D -> C
B -> C
```

Updated relevant parent values:

```text
B:C
D:C
E:C
```

The full array becomes:

```text
A:C, B:C, C:C, D:C, E:C, F:F, G:D, H:K, I:H, J:H, K:K
```

Note: `G` still points to D unless `findSet(G)` is also performed with compression.

---

Question: Show binary search for 17 in `[1, 5, 6, 9, 10, 12, 14, 17, 21]`.

Answer:

```text
low = 0, high = 8, mid = 4, a[4] = 10
17 > 10, search right

low = 5, high = 8, mid = 6, a[6] = 14
17 > 14, search right

low = 7, high = 8, mid = 7, a[7] = 17
found
```

17 is found at index 7.

---

Question: What is a BST and what is the complexity of searching it?

Answer:

A binary search tree is a binary tree where every left subtree contains smaller values and every right subtree contains larger values.

Search complexity is `O(h)`, where `h` is the height of the tree.

Balanced tree:

```text
O(log n)
```

Unbalanced tree:

```text
O(n)
```

---

Question: Write BST search pseudocode.

Answer:

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

---

Question: Insert 54 into this BST: root 44, left 17, right 78, 17 has right 32, 78 has left 50 and right 88, 50 has left 48 and right 62.

Answer:

Path:

```text
54 > 44
54 < 78
54 > 50
54 < 62
```

Insert 54 as the left child of 62.

Result:

```text
              44
            /    \
          17      78
            \    /  \
            32  50   88
                / \
               48 62
                  /
                 54
```

---

Question: What is an AVL tree and how is the tree rebalanced after inserting 54?

Answer:

An AVL tree is a self balancing BST where every node has balance factor `-1`, `0`, or `+1`.

After inserting 54, node 78 becomes unbalanced. Its left child 50 is right heavy, so this is a Left Right case.

Fix:

1. Left rotate at 50.
2. Right rotate at 78.

Balanced result:

```text
              44
            /    \
          17      62
            \    /  \
            32  50   78
                / \    \
               48 54    88
```

---

# Final high probability exam set

Practise these until you can do them without notes:

1. Heap vs sorted array.
2. Insert into heap and show array after every swap.
3. Recursive maxHeapify.
4. Bubble sort first two passes.
5. Comb sort gap explanation and trace.
6. Quick sort first two partitions.
7. Worst case quick sort.
8. Heap sort complexity.
9. DFS discovery and finishing times.
10. DFS complexity.
11. Dijkstra pseudocode and trace.
12. Difference between Dijkstra and Prim.
13. UnionFind purpose in Kruskal.
14. UnionFind path compression trace.
15. Binary search trace.
16. BST definition, search, and complexity.
17. AVL definition and rotation cases.
18. AVL insertion and rebalancing trace.
