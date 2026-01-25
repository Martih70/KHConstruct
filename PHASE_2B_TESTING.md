# Phase 2B Testing Guide

Complete guide for testing all Cost Database CRUD endpoints with curl commands.

## Prerequisites

1. Start the server:
```bash
npm run dev:server
```

2. Have curl installed (built-in on macOS/Linux)

## Step 1: Get Authentication Token

All endpoints require an access token. Login as admin first:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123456"
  }' | jq .
```

Save the `accessToken` from the response. Use it in subsequent requests as:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Or set it as a variable:
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}' | jq -r '.accessToken')

echo $TOKEN  # Verify token is set
```

---

## Testing Units Endpoints

### GET All Units

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/units | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "m2",
      "name": "Square Metre",
      "unit_type": "area",
      "created_at": "..."
    },
    {
      "id": 2,
      "code": "m",
      "name": "Metre",
      "unit_type": "length",
      "created_at": "..."
    },
    {
      "id": 3,
      "code": "item",
      "name": "Item",
      "unit_type": "count",
      "created_at": "..."
    },
    {
      "id": 4,
      "code": "hours",
      "name": "Hours",
      "unit_type": "time",
      "created_at": "..."
    }
  ],
  "count": 4
}
```

### GET Specific Unit

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/units/1 | jq .
```

---

## Testing Cost Categories Endpoints

### GET All Categories

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-categories | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "CAT-001",
      "name": "Structural Works",
      "description": "Foundation, walls, floors, and structural elements",
      "sort_order": 0,
      "created_at": "...",
      "updated_at": "..."
    },
    ...
  ],
  "count": 7
}
```

### GET Specific Category

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-categories/1 | jq .
```

### CREATE Category

```bash
curl -X POST http://localhost:3000/api/v1/cost-categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CAT-999",
    "name": "Test Category",
    "description": "A test category for verification",
    "sort_order": 99
  }' | jq .
```

**Save the ID for use in other tests:**
```bash
CAT_ID=$(curl -s -X POST http://localhost:3000/api/v1/cost-categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"CAT-999","name":"Test Category","sort_order":99}' | jq -r '.data.id')

echo $CAT_ID
```

### UPDATE Category

```bash
curl -X PUT http://localhost:3000/api/v1/cost-categories/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Structural Works",
    "sort_order": 1
  }' | jq .
```

### DELETE Category

```bash
curl -X DELETE http://localhost:3000/api/v1/cost-categories/999 \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Testing Cost Sub-Elements Endpoints

### GET All Sub-Elements

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-sub-elements | jq .
```

### GET Sub-Elements by Category

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-sub-elements/category/1 | jq .
```

This returns sub-elements only in category 1 (Structural Works).

### GET Specific Sub-Element

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-sub-elements/1 | jq .
```

### CREATE Sub-Element

```bash
curl -X POST http://localhost:3000/api/v1/cost-sub-elements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": 1,
    "code": "SUB-999",
    "name": "Test Sub-Element",
    "description": "A test sub-element",
    "sort_order": 99
  }' | jq .
```

### UPDATE Sub-Element

```bash
curl -X PUT http://localhost:3000/api/v1/cost-sub-elements/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Foundation Repairs",
    "sort_order": 0
  }' | jq .
```

### DELETE Sub-Element

```bash
curl -X DELETE http://localhost:3000/api/v1/cost-sub-elements/999 \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Testing Cost Items Endpoints

### GET All Cost Items

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-items | jq .
```

### GET Cost Items with Search/Filter

**Search by term:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/cost-items?searchTerm=roof" | jq .
```

**Filter by category:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/cost-items?categoryId=2" | jq .
```

**Filter by contractor requirement:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/cost-items?isContractorRequired=true" | jq .
```

**Filter by sub-element:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/cost-items?subElementId=1" | jq .
```

**Complex search (multiple filters):**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/v1/cost-items?searchTerm=wall&categoryId=1&isContractorRequired=false" | jq .
```

### GET Cost Items by Sub-Element

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-items/sub-element/1 | jq .
```

### GET Cost Items by Category

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-items/category/1 | jq .
```

### GET Specific Cost Item

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-items/1 | jq .
```

### CREATE Cost Item

```bash
curl -X POST http://localhost:3000/api/v1/cost-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sub_element_id": 1,
    "code": "ITM-999",
    "description": "Test cost item (per m²)",
    "unit_id": 1,
    "material_cost": 100.00,
    "management_cost": 20.00,
    "contractor_cost": 0.00,
    "is_contractor_required": false,
    "volunteer_hours_estimated": 2.5,
    "waste_factor": 1.05,
    "currency": "GBP",
    "price_date": "2024-01-15",
    "region": "UK"
  }' | jq .
```

**Save the ID for updates:**
```bash
ITEM_ID=$(curl -s -X POST http://localhost:3000/api/v1/cost-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sub_element_id":1,"code":"ITM-999","description":"Test (per m²)","unit_id":1,"material_cost":100}' | jq -r '.data.id')

echo $ITEM_ID
```

### UPDATE Cost Item

```bash
curl -X PUT http://localhost:3000/api/v1/cost-items/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "material_cost": 150.00,
    "management_cost": 25.00,
    "waste_factor": 1.10
  }' | jq .
```

### DELETE Cost Item

```bash
curl -X DELETE http://localhost:3000/api/v1/cost-items/999 \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Testing Role-Based Permissions

### Test Estimator Permissions

Create a new estimator user:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "estimator_test",
    "email": "estimator@test.com",
    "password": "testpass123"
  }' | jq .
```

Login as estimator:
```bash
EST_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"estimator_test","password":"testpass123"}' | jq -r '.accessToken')
```

Estimator can CREATE (should work):
```bash
curl -X POST http://localhost:3000/api/v1/cost-categories \
  -H "Authorization: Bearer $EST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"CAT-TEST","name":"Estimator Test"}' | jq .
```

Estimator cannot DELETE (should return 403):
```bash
curl -X DELETE http://localhost:3000/api/v1/cost-categories/1 \
  -H "Authorization: Bearer $EST_TOKEN" | jq .
```

### Test Viewer Permissions

Create a viewer user manually (via admin API in future) or test with invalid role.

Viewer can READ (GET):
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-items | jq .
```

Viewer cannot CREATE (would return 403 with proper role setup).

---

## Testing Error Cases

### Invalid Token

```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3000/api/v1/cost-categories | jq .
```

**Expected: 401 Unauthorized**

### Missing Token

```bash
curl http://localhost:3000/api/v1/cost-categories | jq .
```

**Expected: 401 Missing authorization header**

### Invalid Category ID

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cost-categories/invalid | jq .
```

**Expected: 400 Invalid category ID**

### Duplicate Code

```bash
curl -X POST http://localhost:3000/api/v1/cost-categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"CAT-001","name":"Duplicate"}' | jq .
```

**Expected: 409 Category code already exists**

### Invalid JSON

```bash
curl -X POST http://localhost:3000/api/v1/cost-categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{invalid json}' | jq .
```

**Expected: 400 Validation error**

### Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/v1/cost-categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Missing Code"}' | jq .
```

**Expected: 400 Validation error with field details**

---

## Batch Testing Script

Save this as `test-phase2b.sh` for automated testing:

```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api/v1"

# Get token
echo -e "${YELLOW}Getting authentication token...${NC}"
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}')

TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get token${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Token obtained${NC}\n"

# Test 1: GET Units
echo -e "${YELLOW}Test 1: GET All Units${NC}"
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE_URL/units | jq '.success'

# Test 2: GET Categories
echo -e "${YELLOW}Test 2: GET All Categories${NC}"
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE_URL/cost-categories | jq '.count'

# Test 3: GET Cost Items
echo -e "${YELLOW}Test 3: GET All Cost Items${NC}"
curl -s -H "Authorization: Bearer $TOKEN" \
  $BASE_URL/cost-items | jq '.count'

# Test 4: Search Cost Items
echo -e "${YELLOW}Test 4: Search Cost Items (roof)${NC}"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/cost-items?searchTerm=roof" | jq '.count'

# Test 5: Create Category
echo -e "${YELLOW}Test 5: CREATE Category${NC}"
curl -s -X POST $BASE_URL/cost-categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"CAT-TEST","name":"Test"}' | jq '.data.id'

# Test 6: Filter by category
echo -e "${YELLOW}Test 6: Filter Cost Items by Category${NC}"
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/cost-items?categoryId=1" | jq '.count'

echo -e "${GREEN}All tests completed!${NC}"
```

Run it:
```bash
chmod +x test-phase2b.sh
./test-phase2b.sh
```

---

## Performance Testing

Test with multiple requests:

```bash
for i in {1..10}; do
  curl -s -H "Authorization: Bearer $TOKEN" \
    http://localhost:3000/api/v1/cost-items > /dev/null
  echo "Request $i completed"
done
```

Check server logs to verify performance.

---

## Cleanup

Delete test data:

```bash
# Delete test category
curl -X DELETE http://localhost:3000/api/v1/cost-categories/999 \
  -H "Authorization: Bearer $TOKEN"

# Delete test sub-element
curl -X DELETE http://localhost:3000/api/v1/cost-sub-elements/999 \
  -H "Authorization: Bearer $TOKEN"

# Delete test cost item
curl -X DELETE http://localhost:3000/api/v1/cost-items/999 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Next Steps

1. Test all endpoints manually
2. Verify error handling
3. Check role-based permissions
4. Verify database updates
5. Check logs in `server/logs/`
6. Proceed to Phase 2C (Projects and Estimation)

Enjoy testing! 🚀
