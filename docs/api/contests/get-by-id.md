# Get Contest by ID

Get detailed information about a specific contest.

## Endpoint

```http
GET /contests/:id
```

## Authentication

**Not required** - Public endpoint

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Contest MongoDB ObjectId (24 hex characters) |

## Request

No request body required.

### Example URL

```
GET /contests/507f1f77bcf86cd799439011
```

## Response

### Success (200 OK)

```json
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
  "description": "Educational Codeforces Round",
  "websiteUrl": "https://codeforces.com/contest/1234",
  "registrationUrl": "https://codeforces.com/contestRegistration/1234",
  "difficulty": "MEDIUM",
  "participantCount": 15000,
  "problemCount": 6,
  "platformMetadata": {
    "frozen": false,
    "relativeTimeSeconds": 3600
  },
  "isActive": true,
  "isNotified": false,
  "lastSyncedAt": "2024-02-14T10:00:00.000Z",
  "createdAt": "2024-02-14T10:00:00.000Z",
  "updatedAt": "2024-02-14T10:00:00.000Z",
  "isUpcoming": true,
  "isRunning": false,
  "isFinished": false,
  "timeUntilStart": 86400000,
  "timeUntilEnd": 93600000
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | MongoDB ObjectId |
| `platformId` | string | Platform-specific contest ID |
| `name` | string | Contest name |
| `platform` | string | Platform (codeforces, leetcode, codechef, atcoder) |
| `phase` | string | Contest phase/status |
| `type` | string | Contest type |
| `startTime` | string | Start time (ISO 8601) |
| `endTime` | string | End time (ISO 8601) |
| `durationMinutes` | number | Duration in minutes |
| `description` | string | Contest description (optional) |
| `websiteUrl` | string | Contest URL (optional) |
| `registrationUrl` | string | Registration URL (optional) |
| `difficulty` | string | Difficulty level (optional) |
| `participantCount` | number | Number of participants (optional) |
| `problemCount` | number | Number of problems (optional) |
| `platformMetadata` | object | Platform-specific data |
| `isActive` | boolean | Active status |
| `isNotified` | boolean | Notification sent flag |
| `lastSyncedAt` | string | Last sync time (ISO 8601) |
| `createdAt` | string | Creation time (ISO 8601) |
| `updatedAt` | string | Last update time (ISO 8601) |
| `isUpcoming` | boolean | Virtual: Contest is upcoming |
| `isRunning` | boolean | Virtual: Contest is running |
| `isFinished` | boolean | Virtual: Contest is finished |
| `timeUntilStart` | number | Virtual: Milliseconds until start |
| `timeUntilEnd` | number | Virtual: Milliseconds until end |

## Error Responses

### 404 Not Found

Contest with the specified ID does not exist.

```json
{
  "statusCode": 404,
  "message": "Contest with ID 507f1f77bcf86cd799439011 not found",
  "error": "Not Found"
}
```

### 400 Bad Request

Invalid MongoDB ObjectId format.

```json
{
  "statusCode": 400,
  "message": "Invalid contest ID format",
  "error": "Bad Request"
}
```

## Examples

### cURL

```bash
curl http://localhost:3000/contests/507f1f77bcf86cd799439011
```

### JavaScript (Fetch)

```javascript
const getContestById = async (contestId) => {
  const response = await fetch(`http://localhost:3000/contests/${contestId}`);
  
  if (!response.ok) {
    throw new Error('Contest not found');
  }
  
  return await response.json();
};

// Usage
const contest = await getContestById('507f1f77bcf86cd799439011');
console.log('Contest:', contest.name);
console.log('Starts at:', new Date(contest.startTime).toLocaleString());
```

### Axios

```javascript
import axios from 'axios';

const getContest = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/contests/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Contest not found');
    }
    throw error;
  }
};
```

### Python (Requests)

```python
import requests

def get_contest_by_id(contest_id):
    response = requests.get(f'http://localhost:3000/contests/{contest_id}')
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 404:
        raise Exception('Contest not found')
    else:
        raise Exception(f'Error: {response.json()}')

# Usage
contest = get_contest_by_id('507f1f77bcf86cd799439011')
print(f"Contest: {contest['name']}")
print(f"Platform: {contest['platform']}")
```

## Use Cases

### Display Contest Details

```javascript
const ContestDetails = ({ contestId }) => {
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`/contests/${contestId}`);
        const data = await response.json();
        setContest(data);
      } catch (error) {
        console.error('Failed to load contest:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [contestId]);

  if (loading) return <div>Loading...</div>;
  if (!contest) return <div>Contest not found</div>;

  return (
    <div>
      <h1>{contest.name}</h1>
      <p>Platform: {contest.platform}</p>
      <p>Starts: {new Date(contest.startTime).toLocaleString()}</p>
      <p>Duration: {contest.durationMinutes} minutes</p>
      <p>Difficulty: {contest.difficulty}</p>
      {contest.websiteUrl && (
        <a href={contest.websiteUrl} target="_blank">Visit Contest</a>
      )}
    </div>
  );
};
```

### Check Contest Status

```javascript
const checkContestStatus = async (contestId) => {
  const contest = await fetch(`/contests/${contestId}`).then(res => res.json());
  
  if (contest.isRunning) {
    console.log('Contest is currently running!');
  } else if (contest.isUpcoming) {
    const hoursUntil = contest.timeUntilStart / (1000 * 60 * 60);
    console.log(`Contest starts in ${hoursUntil.toFixed(1)} hours`);
  } else if (contest.isFinished) {
    console.log('Contest has finished');
  }
  
  return contest;
};
```

## MongoDB ObjectId Format

Valid MongoDB ObjectId:
- **Length**: 24 hexadecimal characters
- **Format**: `[0-9a-f]{24}`
- **Example**: `507f1f77bcf86cd799439011`

Invalid IDs will return 400 Bad Request.

## Virtual Fields

The following fields are computed on-the-fly:

- **isUpcoming**: `startTime > now`
- **isRunning**: `startTime <= now && endTime >= now`
- **isFinished**: `endTime < now`
- **timeUntilStart**: Milliseconds until contest starts (0 if started)
- **timeUntilEnd**: Milliseconds until contest ends (0 if finished)

## Related Endpoints

- [List Contests](/api/contests/list) - List all contests
- [Upcoming Contests](/api/contests/upcoming) - Only upcoming
- [Filter by Platform](/api/contests/platform) - Platform-specific
- [Search](/api/contests/search) - Search contests

## Notes

- This is a public endpoint (no authentication required)
- Virtual fields are computed based on current server time
- Platform metadata structure varies by platform
- Contest may be inactive (`isActive: false`) but still returned
