# Search Contests

Search contests by name or description using full-text search.

## Endpoint

```http
GET /contests/search
```

## Authentication

**Not required** - Public endpoint

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | **Yes** | Search query string |

## Request

### Example URLs

```
GET /contests/search?q=codeforces
GET /contests/search?q=weekly
GET /contests/search?q=div2
```

## Response

### Success (200 OK)

Returns an array of contests matching the search query, sorted by relevance score.

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "platformId": "1234",
    "name": "Codeforces Round #900 (Div. 2)",
    "platform": "codeforces",
    "phase": "BEFORE",
    "type": "CF",
    "startTime": "2024-02-15T14:35:00.000Z",
    "endTime": "2024-02-15T16:35:00.000Z",
    "durationMinutes": 120,
    "description": "Educational Codeforces Round for Div. 2 participants",
    "isActive": true,
    "createdAt": "2024-02-14T10:00:00.000Z",
    "updatedAt": "2024-02-14T10:00:00.000Z"
  }
]
```

## Search Behavior

### Indexed Fields
- **name** - Contest name (primary)
- **description** - Contest description (secondary)

### Search Features
- **Full-text search** using MongoDB text index
- **Case-insensitive** matching
- **Partial word** matching
- **Relevance scoring** (most relevant first)

### Limit
Maximum 20 results returned.

## Error Responses

### 400 Bad Request

Missing or empty search query.

```json
{
  "statusCode": 400,
  "message": "Search query parameter \"q\" is required",
  "error": "Bad Request"
}
```

## Examples

### cURL

```bash
# Search for "codeforces"
curl "http://localhost:3000/contests/search?q=codeforces"

# Search for "weekly contest"
curl "http://localhost:3000/contests/search?q=weekly%20contest"

# Search for "div2"
curl "http://localhost:3000/contests/search?q=div2"
```

### JavaScript (Fetch)

```javascript
const searchContests = async (query) => {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query is required');
  }

  const response = await fetch(
    `http://localhost:3000/contests/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return await response.json();
};

// Usage
const results = await searchContests('codeforces div2');
console.log(`Found ${results.length} contests`);
```

### React Search Component

```typescript
import { useState, useEffect } from 'react';

const ContestSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/contests/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(searchTimer);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search contests..."
      />

      {loading && <div>Searching...</div>}

      {results.length > 0 && (
        <ul>
          {results.map(contest => (
            <li key={contest.id}>
              <h3>{contest.name}</h3>
              <p>{contest.platform} - {contest.type}</p>
              <p>{new Date(contest.startTime).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}

      {!loading && query && results.length === 0 && (
        <div>No contests found for "{query}"</div>
      )}
    </div>
  );
};
```

### Python (Requests)

```python
import requests
from urllib.parse import quote

def search_contests(query):
    if not query or not query.strip():
        raise ValueError('Search query is required')
    
    url = f'http://localhost:3000/contests/search?q={quote(query)}'
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 400:
        raise ValueError('Invalid search query')
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
results = search_contests('codeforces')
for contest in results:
    print(f"{contest['name']} - {contest['platform']}")
```

## Use Cases

### Autocomplete Search

```javascript
const AutocompleteSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async (value) => {
    setQuery(value);
    
    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await fetch(
        `/contests/search?q=${encodeURIComponent(value)}`
      ).then(res => res.json());
      
      setSuggestions(results.slice(0, 5)); // Top 5 suggestions
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map(contest => (
            <li key={contest.id}>{contest.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### Search with Filters

```javascript
const searchWithFilters = async (query, platform = null) => {
  // First search
  const results = await fetch(
    `/contests/search?q=${encodeURIComponent(query)}`
  ).then(res => res.json());

  // Then filter by platform if specified
  if (platform) {
    return results.filter(c => c.platform === platform);
  }

  return results;
};

// Usage
const codeforcesResults = await searchWithFilters('div2', 'codeforces');
```

## Search Tips

### Good Search Queries
- ✅ `codeforces` - Platform name
- ✅ `div2` - Contest division
- ✅ `weekly` - Contest frequency
- ✅ `educational` - Contest type
- ✅ `round 900` - Specific round number

### Search Limitations
- ❌ Very short queries (< 2 characters) may return many results
- ❌ Special characters are ignored
- ❌ Exact phrase matching not supported
- ❌ No fuzzy matching (typo tolerance)

## Related Endpoints

- [List All](/api/contests/list) - Paginated list with advanced filtering
- [Filter by Platform](/api/contests/platform) - Platform-specific contests
- [Filter by Type](/api/contests/type) - By contest type

## Notes

- Public endpoint (no authentication required)
- Maximum 20 results
- Sorted by relevance score (MongoDB text score)
- Only searches active contests (`isActive: true`)
- Query parameter `q` is required
- Empty or whitespace-only queries return 400 error
- Results are case-insensitive
