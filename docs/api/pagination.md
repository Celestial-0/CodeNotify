# Pagination

Guide to paginating large result sets in CodeNotify API.

## Overview

Endpoints that return lists support pagination to limit response size and improve performance.

## Pagination Parameters

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Number of items per page (1-100) |
| `offset` | number | 0 | Number of items to skip |

### Example Request

```bash
GET /contests?limit=20&offset=40
```

This returns items 41-60 (skipping first 40).

## Response Format

Paginated responses include metadata:

```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 40,
  "hasMore": true
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of items |
| `total` | number | Total number of items |
| `limit` | number | Items per page |
| `offset` | number | Items skipped |
| `hasMore` | boolean | Whether more items exist |

## Paginated Endpoints

### Contests

```bash
# Get first page
GET /contests?limit=20&offset=0

# Get second page
GET /contests?limit=20&offset=20

# Get third page
GET /contests?limit=20&offset=40
```

### Users (Admin)

```bash
# Get first 10 users
GET /users?limit=10&offset=0

# Get next 10 users
GET /users?limit=10&offset=10
```

## Implementation Examples

### JavaScript (Fetch All Pages)

```javascript
async function fetchAllContests() {
  const allContests = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(
      `http://localhost:3000/contests?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();
    
    allContests.push(...data.data);
    offset += limit;
    hasMore = data.hasMore;
  }
  
  return allContests;
}
```

### React Pagination Component

```typescript
import { useState, useEffect } from 'react';

interface PaginationProps {
  endpoint: string;
  limit?: number;
}

const PaginatedList = ({ endpoint, limit = 20 }: PaginationProps) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, [offset]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}?limit=${limit}&offset=${offset}`);
      const result = await response.json();
      
      setData(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  
  const goToPage = (page: number) => {
    setOffset((page - 1) * limit);
  };
  
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <ul>
            {data.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
          
          <div className="pagination">
            <button 
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <span>Page {currentPage} of {totalPages}</span>
            
            <button 
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

### Infinite Scroll

```typescript
import { useState, useEffect, useRef } from 'react';

const InfiniteScrollList = ({ endpoint }) => {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);
  
  useEffect(() => {
    loadMore();
  }, [offset]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setOffset(prev => prev + 20);
        }
      },
      { threshold: 1.0 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasMore, loading]);
  
  const loadMore = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${endpoint}?limit=20&offset=${offset}`);
      const data = await response.json();
      
      setItems(prev => [...prev, ...data.data]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      
      {loading && <div>Loading...</div>}
      
      <div ref={observerRef} style={{ height: '20px' }} />
      
      {!hasMore && <div>No more items</div>}
    </div>
  );
};
```

### Python (Requests)

```python
import requests

def fetch_all_contests():
    base_url = 'http://localhost:3000/contests'
    all_contests = []
    offset = 0
    limit = 50
    has_more = True
    
    while has_more:
        response = requests.get(base_url, params={'limit': limit, 'offset': offset})
        data = response.json()
        
        all_contests.extend(data['data'])
        offset += limit
        has_more = data['hasMore']
    
    return all_contests

# Usage
contests = fetch_all_contests()
print(f'Total contests: {len(contests)}')
```

## Pagination Strategies

### Offset-Based (Current)

**Pros**:
- Simple to implement
- Can jump to any page
- Predictable page numbers

**Cons**:
- Performance degrades with large offsets
- Can miss items if data changes

**Best for**:
- Small to medium datasets
- When page numbers are needed
- When data is relatively static

### Cursor-Based (Future)

**Pros**:
- Consistent performance
- Handles real-time data well
- No missing items

**Cons**:
- Can't jump to specific page
- More complex implementation

**Best for**:
- Large datasets
- Real-time data
- Infinite scroll

## Performance Tips

### Optimize Limit

```javascript
// Too small - many requests
const limit = 5; // ❌

// Too large - slow response
const limit = 1000; // ❌

// Optimal - balance between requests and response time
const limit = 50; // ✅
```

### Cache Pages

```javascript
const pageCache = new Map();

async function fetchPage(offset, limit) {
  const key = `${offset}-${limit}`;
  
  if (pageCache.has(key)) {
    return pageCache.get(key);
  }
  
  const response = await fetch(`/contests?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  
  pageCache.set(key, data);
  return data;
}
```

### Prefetch Next Page

```javascript
async function fetchWithPrefetch(offset, limit) {
  // Fetch current page
  const currentPage = fetchPage(offset, limit);
  
  // Prefetch next page in background
  fetchPage(offset + limit, limit).catch(() => {});
  
  return currentPage;
}
```

## Limits and Constraints

### Maximum Limit

```bash
# Maximum limit is 100
GET /contests?limit=100  # ✅
GET /contests?limit=200  # ❌ Returns 400 Bad Request
```

### Validation

```json
{
  "statusCode": 400,
  "message": [
    "limit must not be greater than 100",
    "offset must not be less than 0"
  ],
  "error": "Bad Request"
}
```

## Best Practices

### ✅ Do

1. **Use reasonable limits** (20-50 items)
2. **Cache responses** when possible
3. **Show loading states** during fetch
4. **Handle empty results** gracefully
5. **Prefetch next page** for better UX

### ❌ Don't

1. **Don't fetch all data** at once
2. **Don't use very large limits** (>100)
3. **Don't ignore hasMore** flag
4. **Don't make concurrent requests** for same page
5. **Don't forget error handling**

## Related Documentation

- [Contests API](/api/contests)
- [Users API](/api/users)
- [Rate Limiting](/api/rate-limiting)
