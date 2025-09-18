#!/bin/bash

# Memory Book Recreation Test Script
# This script tests the recreation functionality automatically

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BRIGHT='\033[1m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
TEST_USER_ID="9429abe0-9af6-442a-a1de-b74537badbcf"

# Photo pool (using the same photos from your logs)
PHOTO_POOL='["aa5395ce-24b1-41ec-b711-e5f29e54e36e", "2e0ce990-65d6-40e9-810a-01b79582e21f", "4ca2d4bb-a2ec-425b-b232-0bff1d36377e", "684fa310-a553-49ea-887d-a8516ca1e0e6", "bea03b4e-4621-4908-8622-366654a04b58", "2c195e27-4c8a-4b21-a0b7-462c2ba7b8fc", "1433a502-0139-4c45-9735-d495c8a197e9", "27022ccb-b1ff-4710-897b-39d67103f26f", "d85a74dc-c514-4fef-a952-0e24094ea72d"]'

echo -e "${BRIGHT}🧪 Starting Memory Book Recreation Test...${NC}\n"

# Function to make API calls
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -e "${BLUE}📝 $description${NC}"
    
    response=$(curl -s -X "$method" "$url" \
        -H "Content-Type: application/json" \
        -d "$data" 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Request failed${NC}"
        return 1
    fi
    
    echo "$response"
}

# Function to extract JSON value
extract_json_value() {
    local json=$1
    local key=$2
    echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | cut -d'"' -f4
}

# Function to extract JSON array
extract_json_array() {
    local json=$1
    local key=$2
    echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\[[^]]*\]" | sed 's/.*\[\(.*\)\].*/\1/'
}

# Step 1: Create a test memory book
echo -e "${BLUE}📝 Step 1: Creating test memory book...${NC}"

CREATE_DATA='{
    "asset_ids": [],
    "photo_selection_pool": '"$PHOTO_POOL"',
    "story": "",
    "title": "Test Memory Book - Recreation",
    "memory_event": null,
    "background_type": "white",
    "background_color": null,
    "photo_count": 3,
    "theme_id": "8581031d-1763-427d-98d5-6147fcff26e5",
    "print_size": "8.5x11",
    "output": "JPG",
    "photo_selection_method": "last_100"
}'

create_response=$(make_request "POST" "$BASE_URL/api/memory-books/create-magic-memory" "$CREATE_DATA" "Creating memory book")

if [[ $create_response != *"success"* ]] || [[ $create_response != *"book_id"* ]]; then
    echo -e "${RED}❌ Failed to create memory book${NC}"
    echo "$create_response"
    exit 1
fi

# Extract book ID
book_id=$(extract_json_value "$create_response" "book_id")
echo -e "${GREEN}✅ Created memory book: $book_id${NC}"

# Step 2: Generate the initial memory book
echo -e "\n${BLUE}🤖 Step 2: Generating initial memory book...${NC}"

GENERATE_DATA='{
    "memoryBookId": "'"$book_id"'",
    "userId": "'"$TEST_USER_ID"'",
    "photoCount": 3
}'

generate_response=$(make_request "POST" "$BASE_URL/api/ai/magic-memory" "$GENERATE_DATA" "Generating initial memory book")

if [[ $generate_response != *"success"* ]] || [[ $generate_response != *"selected_photo_ids"* ]]; then
    echo -e "${RED}❌ Failed to generate memory book${NC}"
    echo "$generate_response"
    exit 1
fi

# Extract selected photos
selected_photos=$(extract_json_array "$generate_response" "selected_photo_ids")
echo -e "${GREEN}✅ Generated memory book with photos: $selected_photos${NC}"

# Step 3: Test recreation
echo -e "\n${BLUE}🔄 Step 3: Testing recreation functionality...${NC}"

# Get the first photo for replacement (remove quotes and brackets)
first_photo=$(echo "$selected_photos" | sed 's/^\[//' | sed 's/\]$//' | cut -d'"' -f2)
echo -e "${YELLOW}🎯 Planning to replace photo: $first_photo${NC}"

UPDATE_DATA='{
    "book_id": "'"$book_id"'",
    "asset_ids": [],
    "photo_selection_pool": '"$PHOTO_POOL"',
    "story": "",
    "title": "Test Memory Book - Recreation",
    "memory_event": null,
    "background_type": "white",
    "background_color": null,
    "photo_count": 3,
    "theme_id": "8581031d-1763-427d-98d5-6147fcff26e5",
    "print_size": "8.5x11",
    "output": "JPG",
    "photo_selection_method": "replace_selected",
    "photos_to_replace": ["'"$first_photo"'"]
}'

update_response=$(make_request "POST" "$BASE_URL/api/memory-books/update-magic-memory" "$UPDATE_DATA" "Updating memory book for recreation")

if [[ $update_response != *"success"* ]]; then
    echo -e "${RED}❌ Failed to update memory book for recreation${NC}"
    echo "$update_response"
    exit 1
fi

echo -e "${GREEN}✅ Memory book updated for recreation${NC}"

# Step 4: Test the recreation generation
echo -e "\n${BLUE}🤖 Step 4: Testing recreation generation...${NC}"

recreate_response=$(make_request "POST" "$BASE_URL/api/ai/magic-memory" "$GENERATE_DATA" "Generating recreation")

if [[ $recreate_response != *"success"* ]] || [[ $recreate_response != *"selected_photo_ids"* ]]; then
    echo -e "${RED}❌ Failed to generate recreation${NC}"
    echo "$recreate_response"
    exit 1
fi

# Extract recreated photos
recreated_photos=$(extract_json_array "$recreate_response" "selected_photo_ids")
echo -e "${GREEN}✅ Recreation completed successfully!${NC}"
echo -e "${CYAN}📸 Original photos: $selected_photos${NC}"
echo -e "${CYAN}📸 Recreated photos: $recreated_photos${NC}"

# Check if photos were actually replaced
if [[ "$selected_photos" == "$recreated_photos" ]]; then
    echo -e "${YELLOW}⚠️ Warning: No photos were replaced (same photos as original)${NC}"
else
    echo -e "${GREEN}✅ Photos were successfully replaced!${NC}"
fi

echo -e "\n${BRIGHT}🎉 Test completed successfully!${NC}"
echo -e "${CYAN}📋 Memory book ID: $book_id${NC}"
echo -e "${CYAN}💡 You can view this memory book in your browser at: $BASE_URL/app/memory-books${NC}"
