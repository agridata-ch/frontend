# PowerShell script to sync translations from POEditor

# Stop on error
$ErrorActionPreference = "Stop"

# Load environment variables from .env file
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path -Path (Split-Path -Parent (Split-Path -Parent $scriptDir)) -ChildPath ".env"

if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
                $value = $matches[1]
            }
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Check required environment variables
$POEDITOR_API_TOKEN = [Environment]::GetEnvironmentVariable("POEDITOR_API_TOKEN", "Process")
$POEDITOR_PROJECT_ID = [Environment]::GetEnvironmentVariable("POEDITOR_PROJECT_ID", "Process")

if (-not $POEDITOR_API_TOKEN -or -not $POEDITOR_PROJECT_ID) {
    Write-Host "Error: Missing POEDITOR_API_TOKEN or POEDITOR_PROJECT_ID in .env file"
    exit 1
}

# Create output directory if it doesn't exist
$OUTPUT_DIR = Join-Path -Path $scriptDir -ChildPath "..\assets\i18n"
if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -Path $OUTPUT_DIR -ItemType Directory -Force | Out-Null
}

# Get list of languages
$PARAMS = @{
    Uri = "https://api.poeditor.com/v2/languages/list"
    Method = "POST"
    Body = @{
        api_token = $POEDITOR_API_TOKEN
        id = $POEDITOR_PROJECT_ID
    }
    ContentType = "application/x-www-form-urlencoded"
}

try {
    $LANGUAGES_RESPONSE = Invoke-RestMethod @PARAMS
} catch {
    Write-Host "Error fetching languages: $_"
    exit 1
}

# Extract language codes
$LANGUAGE_CODES = $LANGUAGES_RESPONSE.result.languages | ForEach-Object { $_.code }

# Process each language
foreach ($LANG_CODE in $LANGUAGE_CODES) {
    Write-Host "Processing language: $LANG_CODE"
    # Get export URL for JSON format
    $EXPORT_PARAMS = @{
        Uri = "https://api.poeditor.com/v2/projects/export"
        Method = "POST"
        Body = @{
            api_token = $POEDITOR_API_TOKEN
            id = $POEDITOR_PROJECT_ID
            language = $LANG_CODE
            type = "key_value_json"
            filters = "translated"
        }
        ContentType = "application/x-www-form-urlencoded"
    }
    try {
        $EXPORT_RESPONSE = Invoke-RestMethod @EXPORT_PARAMS
        $DOWNLOAD_URL = $EXPORT_RESPONSE.result.url
        $OUTPUT_FILE = Join-Path -Path $OUTPUT_DIR -ChildPath "$LANG_CODE.json"
        Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile $OUTPUT_FILE
        Write-Host "Downloaded $LANG_CODE translations to $OUTPUT_FILE"
    } catch {
        Write-Host "Error processing $LANG_CODE $_"
        continue
    }
}

Write-Host "Translation sync completed"
