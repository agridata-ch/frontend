#!/bin/bash
# Script to sync translations from POEditor with the project's i18n files
# do not edit the ascii art below :)

# Exit on error
set -e

# Define color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BLACK='\033[1;30m'
RED='\033[0;31m'
GRAY='\033[0;37m'
LIGHT_BLUE='\033[1;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print header with tractor and trailer
echo -e "${BOLD}${GREEN}                                              #**,***,,,,,,#                     ${NC}"
echo -e "${BOLD}${GREEN}                                              #****,,,,,,**#        ${BLACK}#(           ${NC}"
echo -e "${BOLD}${GREEN}  ┌───────────────────────────────────┐      /(*,,,,,,,****#,       ${BLACK}#(           ${NC}"
echo -e "${BOLD}${GREEN}  │                                   │      #,,,,,,,*******#       ${BLACK}#(           ${NC}"
echo -e "${BOLD}${GREEN}  │   ${BLUE}AgriData POEditor Key Tractor${GREEN}   │    /(*****(/********#############((((((   ${NC}"
echo -e "${BOLD}${GREEN}  │                                   │   ((#&&&&&&&((((/&#%############(####((   ${NC}"
echo -e "${BOLD}${GREEN}  │      ${BLUE}🌱 🚜 🌾 🐄 🌽 🐓 🍎 🌻${GREEN}      │  &&&&##&&&##&&&&#&&&##########(((((((((   ${NC}"
echo -e "${BOLD}${GREEN}  │                                   │ &&&#%(%(((%#%#&&&&%&#####/,*////,,/((((   ${NC}"
echo -e "${BOLD}${GRAY}  &&&&#&#%#&&&&&&&&&&&&&%##&&&&&&&&&&&&&&${GREEN}/&&&#&((/####&#&&&    ####&&&(&&#&&&((,,  ${NC}"
echo -e "${BOLD}${RED}       #&#&&            &&&##&            ${GREEN}&&&##&%#%&##&&&     @@@@&&&&##&#&&&@.,,  ${NC}"
echo -e "${BOLD}${RED}      &&%%#&&@         &&&#%&&&            ${GREEN}&&&&&&&&&&&&&           &&&&&&&&&       ${NC}"
echo -e "${BOLD}${RED}        #&&               &&                   ${GREEN}@&&&&                 &&&&        ${NC}\n"

# Load environment variables from .env file (at project root)
echo -e "${BLUE}🌱 Planting environment variables...${NC}"
if [ -f "$(dirname "$0")/../../.env" ]; then
    set -a
    # shellcheck source=/dev/null
    source "$(dirname "$0")/../../.env"
    set +a
    echo -e "${GREEN}🌿 Environment variables sprouted successfully${NC}"
else
    echo -e "${LIGHT_BLUE}⚠ No .env seeds found${NC}"
fi

# Check if the required environment variables are set
if [ -z "$POEDITOR_API_TOKEN" ] || [ -z "$POEDITOR_PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: Missing seeds (POEDITOR_API_TOKEN or POEDITOR_PROJECT_ID)${NC}"
    echo -e "${LIGHT_BLUE}Please plant these seeds in your .env file:${NC}"
    echo -e "${BLUE}POEDITOR_API_TOKEN=${NC}your_api_token"
    echo -e "${BLUE}POEDITOR_PROJECT_ID=${NC}your_project_id"
    exit 1
fi

# Create output directory if it doesn't exist
SCRIPT_DIR=$(dirname "$0")
OUTPUT_DIR="$SCRIPT_DIR/../assets/i18n"
if [ ! -d "$OUTPUT_DIR" ]; then
    echo -e "${BLUE}� Preparing the fields...${NC}"
    mkdir -p "$OUTPUT_DIR"
    echo -e "${GREEN}🌾 Field prepared: ${NC}$OUTPUT_DIR"
else
    echo -e "${GREEN}🌾 Fields already plowed and ready: ${NC}$OUTPUT_DIR"
fi

# Get list of languages
echo -e "\n${BLUE}🌍 Surveying the global farmlands...${NC}"
LANGUAGES_RESPONSE=$(curl -s -X POST \
    -d "api_token=$POEDITOR_API_TOKEN&id=$POEDITOR_PROJECT_ID" \
    https://api.poeditor.com/v2/languages/list)

# Check for API errors
if ! echo "$LANGUAGES_RESPONSE" | grep -q '"status":"success"'; then
    echo -e "${RED}❌ Crop failure when fetching languages:${NC} $LANGUAGES_RESPONSE"
    exit 1
fi

# Extract language codes using jq if available, or grep/sed fallback
echo -e "${BLUE}🔍 Identifying crop varieties...${NC}"
if command -v jq &> /dev/null; then
    LANGUAGE_CODES=$(echo "$LANGUAGES_RESPONSE" | jq -r '.result.languages[].code')
    echo -e "${GREEN}🌱 Using premium equipment (jq) for sorting${NC}"
else
    LANGUAGE_CODES=$(echo "$LANGUAGES_RESPONSE" | grep -o '"code":"[^"]*"' | sed 's/"code":"//g' | sed 's/"//g')
    echo -e "${LIGHT_BLUE}⚠ Premium equipment not found, using manual tools (grep/sed)${NC}"
fi

# Count languages
LANGUAGE_COUNT=$(echo "$LANGUAGE_CODES" | wc -l)
LANGUAGE_CODES_DISPLAY=$(echo "$LANGUAGE_CODES" | tr '\n' ' ')
echo -e "${GREEN}🌾 Discovered ${BOLD}$LANGUAGE_COUNT${NC}${GREEN} language varieties: ${NC}${LIGHT_BLUE}$LANGUAGE_CODES_DISPLAY${NC}\n"

# Process each language
echo -e "${BLUE}� Starting the harvest:${NC}"
for LANG_CODE in $LANGUAGE_CODES; do
    echo -e "\n${LIGHT_BLUE}🌾 Harvesting language: ${BOLD}$LANG_CODE${NC}"
    
    # Get export URL for JSON format
    echo -e "${BLUE}  🌱 Preparing to harvest...${NC}"
    EXPORT_RESPONSE=$(curl -s -X POST \
        -d "api_token=$POEDITOR_API_TOKEN&id=$POEDITOR_PROJECT_ID&language=$LANG_CODE&type=key_value_json&filters=translated" \
        https://api.poeditor.com/v2/projects/export)
    
    # Check for API errors
    if ! echo "$EXPORT_RESPONSE" | grep -q '"status":"success"'; then
        echo -e "${RED}  ❌ Crop failure during harvest:${NC} $EXPORT_RESPONSE"
        continue
    fi
    
    # Extract download URL
    if command -v jq &> /dev/null; then
        DOWNLOAD_URL=$(echo "$EXPORT_RESPONSE" | jq -r '.result.url')
    else
        DOWNLOAD_URL=$(echo "$EXPORT_RESPONSE" | grep -o '"url":"[^"]*"' | sed 's/"url":"//g' | sed 's/"//g')
    fi
    
    # Download the translations
    OUTPUT_FILE="$OUTPUT_DIR/$LANG_CODE.json"
    echo -e "${BLUE}  🧺 Collecting harvest...${NC}"
    
    # Get file size before download for comparison
    FILE_SIZE_BEFORE=0
    if [ -f "$OUTPUT_FILE" ]; then
        FILE_SIZE_BEFORE=$(wc -c < "$OUTPUT_FILE")
    fi
    
    curl -s -o "$OUTPUT_FILE" "$DOWNLOAD_URL"
    
    # Get file size after download
    FILE_SIZE_AFTER=$(wc -c < "$OUTPUT_FILE")
    FILE_SIZE_DIFF=$((FILE_SIZE_AFTER - FILE_SIZE_BEFORE))
    
    if [ $FILE_SIZE_DIFF -gt 0 ]; then
        SIZE_CHANGE="(yield increased by $FILE_SIZE_DIFF bytes 📈)"
    elif [ $FILE_SIZE_DIFF -lt 0 ]; then
        SIZE_CHANGE="(yield decreased by $((FILE_SIZE_DIFF * -1)) bytes 📉)"
    else
        SIZE_CHANGE="(same yield as before 📊)"
    fi
    
    echo -e "${GREEN}  🌽 Harvest stored in:${NC} $OUTPUT_FILE ${LIGHT_BLUE}$SIZE_CHANGE${NC}"
done

echo -e "\n${BOLD}${GREEN}🎉 Harvest completed successfully! All crops are in the barn! 🚜${NC}\n"
