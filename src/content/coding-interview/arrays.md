# Arrays & Strings

Patterns and drills for common interview topics.

## Core patterns
- Two pointers (same/opposite direction)
- Sliding window (fixed/variable)
- Prefix sums
- Frequency maps

## Practice checklist
- Reverse in-place
- Rotate array
- Longest substring without repeat
- Minimum window substring
- Product of array except self

```python
def product_except_self(nums):
    n = len(nums)
    left = [1]*n
    right = [1]*n
    for i in range(1, n):
        left[i] = left[i-1] * nums[i-1]
    for i in range(n-2, -1, -1):
        right[i] = right[i+1] * nums[i+1]
    return [left[i]*right[i] for i in range(n)]
```

