# CMPU2001 2024/25 Latest Paper: Full Answer Guide


# Question 1

## Question 1(a)

Question: What are the differences, if any, between a Heap array and a sorted array? What are the main advantages of a binary Heap compared to both an unsorted array and a sorted array from the point of view of insert() and remove() operations?

Answer:

A heap array is not the same as a sorted array. A heap array only satisfies the heap property. In a max heap, every parent is greater than or equal to its children. It does not mean all elements are globally sorted.

For example:

```text
Heap array:
[12, 11, 8, 10, 7, 5, 1, 9]
```

This is a valid max heap because every parent is larger than its children, but it is not sorted because `10` comes after `8`.

A sorted array has a complete global order:

```text
[12, 11, 10, 9, 8, 7, 5, 1]
```

Comparison for priority queue operations:

| Structure | insert() | remove max/min | Explanation |
|---|---:|---:|---|
| Unsorted array | O(1) | O(n) | Insert at the end, but removal needs a full search |
| Sorted array | O(n) | O(1) | Removal is easy, but insertion needs shifting |
| Binary heap | O(log n) | O(log n) | Both operations move along tree height only |

The main advantage of a binary heap is that it gives a good compromise. Insert and remove are both logarithmic, so neither operation is extremely expensive.

---

## Question 1(b)

Question: Selection sort and Heap sort are similar in that they are both examples of hard split easy join. Comment on this.

Answer:

Selection sort and heap sort are similar because both repeatedly select the next largest or smallest item and place it into its final sorted position.

In selection sort, the hard part is finding the next minimum or maximum by scanning the unsorted part of the array. The joining step is easy because once the item is found, it is simply swapped into position.

In heap sort, the hard part is building and maintaining the heap. The joining step is easy because the root of the heap is always the next maximum in a max heap. Heap sort improves selection sort because it avoids scanning the entire unsorted part every time.

Selection sort repeatedly does a linear search, so it is `O(n^2)`. Heap sort uses the heap to make repeated selection cost `O(log n)`, giving total complexity `O(n log n)`.

---

## Question 1(c)

Question: Draw the heap array as a two-dimensional binary tree and show the contents of `hPos[]`.

Given heap array:

```text
index: 0   1   2   3   4   5   6   7
value: 12  11  8   10  7   5   1   9
```

Answer:

Tree form:

```text
              12
           /      \
         11        8
       /   \      / \
     10     7    5   1
    /
   9
```

Array to tree mapping:

```text
a[0] = 12
a[1] = 11, a[2] = 8
a[3] = 10, a[4] = 7, a[5] = 5, a[6] = 1
a[7] = 9
```

`hPos[]` stores the index position of each key in the heap:

| key | 1 | 5 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| hPos[key] | 6 | 5 | 4 | 2 | 7 | 3 | 1 | 0 |

---

## Question 1(d)

Question: Using tree and array diagrams, illustrate the effect of inserting a node whose key is 13 into the heap.

Answer:

Start heap:

```text
[12, 11, 8, 10, 7, 5, 1, 9]
```

Append 13 at the next free position:

```text
[12, 11, 8, 10, 7, 5, 1, 9, 13]
```

Tree after append:

```text
              12
           /      \
         11        8
       /   \      / \
     10     7    5   1
    /  \
   9    13
```

13 is larger than its parent 10, so swap:

```text
[12, 11, 8, 13, 7, 5, 1, 9, 10]
```

Tree:

```text
              12
           /      \
         11        8
       /   \      / \
     13     7    5   1
    /  \
   9    10
```

13 is larger than its new parent 11, so swap:

```text
[12, 13, 8, 11, 7, 5, 1, 9, 10]
```

Tree:

```text
              12
           /      \
         13        8
       /   \      / \
     11     7    5   1
    /  \
   9    10
```

13 is larger than its new parent 12, so swap:

```text
[13, 12, 8, 11, 7, 5, 1, 9, 10]
```

Final tree:

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

## Question 1(e)

Question: Write in pseudocode a recursive version, `maxHeapify(int k)`, of the `siftDown(int k)` heap operation.

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

This is recursive because after swapping with the larger child, it calls itself on the child position. The operation stops when the node is larger than both children or when it reaches a leaf.

Complexity: `O(log n)`, because the node moves down at most the height of the heap.

---

# Question 2

## Question 2(a)

Question: Show the detailed workings for the first two passes of bubble sort on:

```text
6 3 1 9 8 2 4 7 0 5
```

Use the resulting array to point out a significant flaw in bubble sort.

Answer:

Start:

```text
6 3 1 9 8 2 4 7 0 5
```

Pass 1:

```text
6 3 1 9 8 2 4 7 0 5
3 6 1 9 8 2 4 7 0 5
3 1 6 9 8 2 4 7 0 5
3 1 6 8 9 2 4 7 0 5
3 1 6 8 2 9 4 7 0 5
3 1 6 8 2 4 9 7 0 5
3 1 6 8 2 4 7 9 0 5
3 1 6 8 2 4 7 0 9 5
3 1 6 8 2 4 7 0 5 9
```

After pass 1:

```text
3 1 6 8 2 4 7 0 5 9
```

Pass 2:

```text
3 1 6 8 2 4 7 0 5 9
1 3 6 8 2 4 7 0 5 9
1 3 6 2 8 4 7 0 5 9
1 3 6 2 4 8 7 0 5 9
1 3 6 2 4 7 8 0 5 9
1 3 6 2 4 7 0 8 5 9
1 3 6 2 4 7 0 5 8 9
```

After pass 2:

```text
1 3 6 2 4 7 0 5 8 9
```

Significant flaw:

Bubble sort moves small values left very slowly. The value `0` starts near the end. Even after two complete passes, it is still not at the front. This shows why bubble sort is inefficient. It only swaps neighbouring elements, so values can move only one position at a time in the direction they need to go.

---

## Question 2(b)

Question: What is the basic idea behind comb sort that makes it an improvement on bubble sort? Apply comb sort to the array until it becomes bubble sort.

Answer:

Comb sort improves bubble sort by comparing elements that are far apart before comparing adjacent elements. It uses a gap. The gap starts large and shrinks until it becomes 1. When the gap is 1, comb sort has become bubble sort.

This helps because small values near the right side can jump left quickly instead of moving one position per pass.

Using shrink factor 1.3 on length 10:

```text
gaps: 7, 5, 3, 2, 1
```

Start:

```text
6 3 1 9 8 2 4 7 0 5
```

Gap 7:

Compare positions distance 7 apart.

```text
6 0 1 9 8 2 4 7 3 5
```

Gap 5:

```text
2 0 1 3 5 6 4 7 9 8
```

Gap 3:

No swaps:

```text
2 0 1 3 5 6 4 7 9 8
```

Gap 2:

```text
1 0 2 3 4 6 5 7 9 8
```

Gap 1, now it becomes bubble sort:

```text
0 1 2 3 4 5 6 7 8 9
```

---

## Question 2(c)

Question: Show the first two partitionings that occur when quick sort is applied to the array.

Answer:

Assumption: the first element is used as the pivot. If a different partition scheme is used, the exact intermediate arrays may differ, but the same principle applies.

Start:

```text
6 3 1 9 8 2 4 7 0 5
```

First pivot is `6`.

After partitioning around 6:

```text
4 3 1 5 0 2 | 6 | 7 8 9
```

Full array:

```text
4 3 1 5 0 2 6 7 8 9
```

Now quick sort partitions the left subarray:

```text
4 3 1 5 0 2
```

Second pivot is `4`.

After partitioning around 4:

```text
0 3 1 2 | 4 | 5
```

Full array after the second partition:

```text
0 3 1 2 4 5 6 7 8 9
```

---

## Question 2(d)

Question: Provide a simple example which shows quick sort at its worst. What is the complexity of quick sort at its worst?

Answer:

A simple worst case occurs when the first element is always chosen as pivot and the array is already sorted:

```text
1 2 3 4 5 6 7
```

The pivot is always the smallest item. Each partition creates one empty side and one side of size `n - 1`.

That gives:

```text
n + (n - 1) + (n - 2) + ... + 1
```

Worst case complexity:

```text
O(n^2)
```

---

## Question 2(e)

Question: Write down the complexity of heap sort and outline how it is arrived at. Contrast it with bubble sort and quick sort.

Answer:

Heap sort complexity:

```text
O(n log n)
```

How it is arrived at:

1. Build the heap: `O(n)`
2. Remove the root `n` times.
3. Each removal uses heapify, which costs `O(log n)`.

So:

```text
O(n) + n * O(log n) = O(n log n)
```

Contrast:

Bubble sort is `O(n^2)` in average and worst cases because it repeatedly compares adjacent items across many passes.

Quick sort is `O(n log n)` on average, but it can become `O(n^2)` in the worst case if the partitions are badly unbalanced.

Heap sort is not usually as cache friendly as quick sort in practice, but it has a guaranteed `O(n log n)` worst case, which makes it more reliable in theory.

---

# Question 3

## Question 3(a)

Question: Given the DFS algorithm and graph, show step by step how it traverses the graph by computing `u.d`, `u.f`, `u.color`, and `u.π` for each vertex.

Answer:

The graph is the standard DFS example with vertices:

```text
u, v, w, x, y, z
```

Using vertex order:

```text
u, v, w, x, y, z
```

And adjacency order:

```text
u: v, x
v: y
w: y, z
x: v
y: x
z: z
```

Initial state:

```text
All vertices are WHITE
All parents are NIL
time = 0
```

Step by step:

1. Start at `u`.
   - `u.d = 1`
   - `u.color = GRAY`

2. From `u`, visit `v`.
   - `v.parent = u`
   - `v.d = 2`
   - `v.color = GRAY`

3. From `v`, visit `y`.
   - `y.parent = v`
   - `y.d = 3`
   - `y.color = GRAY`

4. From `y`, visit `x`.
   - `x.parent = y`
   - `x.d = 4`
   - `x.color = GRAY`

5. From `x`, edge goes to `v`, but `v` is already GRAY, so do not visit it again.
   - finish `x`
   - `x.color = BLACK`
   - `x.f = 5`

6. Finish `y`.
   - `y.color = BLACK`
   - `y.f = 6`

7. Finish `v`.
   - `v.color = BLACK`
   - `v.f = 7`

8. Return to `u`. Its other neighbour `x` is already BLACK.
   - finish `u`
   - `u.color = BLACK`
   - `u.f = 8`

9. Next vertex in main loop is `v`, already BLACK. Skip it.

10. Next vertex is `w`, still WHITE.
    - `w.d = 9`
    - `w.color = GRAY`
    - `w.parent = NIL`

11. From `w`, neighbour `y` is already BLACK, so skip it.

12. From `w`, visit `z`.
    - `z.parent = w`
    - `z.d = 10`
    - `z.color = GRAY`

13. From `z`, there is a self edge to `z`. It is already GRAY, so skip it.
    - finish `z`
    - `z.color = BLACK`
    - `z.f = 11`

14. Finish `w`.
    - `w.color = BLACK`
    - `w.f = 12`

Final table:

| Vertex | d | f | parent π | final color |
|---|---:|---:|---|---|
| u | 1 | 8 | NIL | BLACK |
| v | 2 | 7 | u | BLACK |
| y | 3 | 6 | v | BLACK |
| x | 4 | 5 | y | BLACK |
| w | 9 | 12 | NIL | BLACK |
| z | 10 | 11 | w | BLACK |

DFS forest:

```text
u
└── v
    └── y
        └── x

w
└── z
```

---

## Question 3(b)

Question: Using the pseudocode in part (a), derive the complexity of `DFS(G)` assuming that `G` is a single connected graph.

Answer:

The complexity of DFS using adjacency lists is:

```text
O(V + E)
```

Reason:

The initialization loop visits every vertex once:

```text
O(V)
```

The main DFS process also discovers each vertex once:

```text
O(V)
```

Inside `DFSVisit`, the algorithm scans each adjacency list. Across the whole graph, the total number of adjacency list entries scanned is the number of edges:

```text
O(E)
```

Therefore:

```text
O(V) + O(E) = O(V + E)
```

Even if the graph is connected, the algorithm still touches all vertices and scans all adjacency lists, so the complexity remains `O(V + E)`.

---

## Question 3(c)

Question: Write Dijkstra's shortest path tree algorithm assuming adjacency lists and show its detailed working on the graph.

Answer:

Important note: the 2024/25 paper does not explicitly state the source vertex for Dijkstra. I assume source `G`, because the earlier paper used the same weighted graph and explicitly started at `G`.

Dijkstra pseudocode:

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

Graph adjacency list:

```text
A: (B,7), (D,5)
B: (A,7), (C,8), (D,9), (E,7)
C: (B,8), (E,5)
D: (A,5), (B,9), (E,15), (F,6)
E: (B,7), (C,5), (D,15), (F,8), (G,9)
F: (D,6), (E,8), (G,11)
G: (E,9), (F,11)
```

Initial:

```text
distance[G] = 0
All other distances = infinity
All parents = NIL
```

Detailed table:

| Step | removeMin | Heap after relaxations | distance[A,B,C,D,E,F,G] | parent[A,B,C,D,E,F,G] |
|---:|---|---|---|---|
| 1 | G | E:9, F:11 | ∞, ∞, ∞, ∞, 9, 11, 0 | NIL, NIL, NIL, NIL, G, G, NIL |
| 2 | E | F:11, C:14, B:16, D:24 | ∞, 16, 14, 24, 9, 11, 0 | NIL, E, E, E, G, G, NIL |
| 3 | F | C:14, B:16, D:17 | ∞, 16, 14, 17, 9, 11, 0 | NIL, E, E, F, G, G, NIL |
| 4 | C | B:16, D:17 | ∞, 16, 14, 17, 9, 11, 0 | NIL, E, E, F, G, G, NIL |
| 5 | B | D:17, A:23 | 23, 16, 14, 17, 9, 11, 0 | B, E, E, F, G, G, NIL |
| 6 | D | A:22 | 22, 16, 14, 17, 9, 11, 0 | D, E, E, F, G, G, NIL |
| 7 | A | empty | 22, 16, 14, 17, 9, 11, 0 | D, E, E, F, G, G, NIL |

Final shortest distances from G:

| Vertex | Distance | Parent |
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

Edges in the SPT:

```text
G-E, G-F, E-B, E-C, F-D, D-A
```

---

# Question 4

## Question 4(a)

Question: Show how binary search works when searching for 17 in the following array:

```text
1 5 6 9 10 12 14 17 21
```

Answer:

Array with indexes:

```text
index: 0 1 2 3 4  5  6  7  8
value: 1 5 6 9 10 12 14 17 21
```

Search target:

```text
17
```

Step 1:

```text
low = 0
high = 8
mid = (0 + 8) / 2 = 4
a[4] = 10
```

17 is greater than 10, so search the right half.

Step 2:

```text
low = 5
high = 8
mid = (5 + 8) / 2 = 6
a[6] = 14
```

17 is greater than 14, so search the right half.

Step 3:

```text
low = 7
high = 8
mid = (7 + 8) / 2 = 7
a[7] = 17
```

Found 17 at index 7.

---

## Question 4(b)

Question: What is a binary search tree? Mention any specific advantage or possible disadvantage. What is the complexity of searching a BST?

Answer:

A binary search tree is a binary tree where, for every node:

- all values in the left subtree are smaller than the node,
- all values in the right subtree are larger than the node,
- the left and right subtrees are also binary search trees.

Advantage:

A BST allows efficient searching, insertion, and deletion when the tree is balanced. In a balanced BST, each comparison lets us discard roughly half of the remaining tree.

Possible disadvantage:

A normal BST can become unbalanced. If values are inserted in sorted order, the tree can become shaped like a linked list.

Complexity:

Searching a BST takes:

```text
O(h)
```

where `h` is the height of the tree.

For a balanced BST:

```text
O(log n)
```

For a badly unbalanced BST:

```text
O(n)
```

---

## Question 4(c)

Question: Write in pseudocode the algorithm for searching a BST.

Answer:

Iterative version:

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

Recursive version:

```text
BSTSearch(node, key):
    if node == NIL or node.key == key:
        return node

    if key < node.key:
        return BSTSearch(node.left, key)
    else:
        return BSTSearch(node.right, key)
```

Either version is acceptable. Both follow the BST ordering property.

---

## Question 4(d)

Question: Given the BST, show how it would be modified by inserting 54.

Answer:

Starting tree:

```text
              44
            /    \
          17      78
            \    /  \
            32  50   88
                / \
               48 62
```

Insert 54:

```text
54 > 44, go right
54 < 78, go left
54 > 50, go right
54 < 62, go left
```

So 54 is inserted as the left child of 62.

Tree after insertion:

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

## Question 4(e)

Question: What is an AVL tree? Include the idea of a rotation. Show how the tree that results from inserting 54 would be rebalanced if it were an AVL tree.

Answer:

An AVL tree is a self balancing binary search tree. For every node, the heights of the left and right subtrees may differ by at most 1.

The balance factor is:

```text
height(left subtree) - height(right subtree)
```

Allowed values:

```text
-1, 0, +1
```

If the balance factor becomes `-2` or `+2`, the tree must be rebalanced using rotations.

A rotation is a local rearrangement of nodes that restores balance while keeping the binary search tree order correct.

After inserting 54, the tree is:

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

The first unbalanced node is 78.

At node 78:

- left subtree is rooted at 50,
- 50 is heavier on its right side because of 62 and 54.

This is a Left Right case.

To fix a Left Right case:

1. Left rotate at 50.
2. Right rotate at 78.

After left rotation at 50:

```text
              44
            /    \
          17      78
            \    /  \
            32  62   88
                /
               50
              /  \
             48  54
```

After right rotation at 78:

```text
              44
            /    \
          17      62
            \    /  \
            32  50   78
                / \    \
               48 54    88
```

This is balanced and still satisfies the BST property.
