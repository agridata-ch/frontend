#!/usr/bin/env bash
set -euo pipefail

OUTPUT_FILE="THIRD_PARTY_LICENSES.md"
TMP_FILE="/tmp/THIRD_PARTY_LICENSES.md"
CUSTOM_FORMAT="/tmp/customFormat.json"

# Write custom format config to temp file
cat > "$CUSTOM_FORMAT" <<'EOF'
{
  "licenses": "",
  "copyright": ""
}
EOF

# Generate license report
generate() {
  npx license-checker --customPath "$CUSTOM_FORMAT" --markdown
}

if [[ "${1:-}" == "--check" ]]; then
  echo "🔍 Checking if $OUTPUT_FILE is up to date..."
  generate > "$TMP_FILE"

  if ! diff -q "$TMP_FILE" "$OUTPUT_FILE" >/dev/null; then
    echo "❌ $OUTPUT_FILE is not up to date."
    echo "   Differences:"
    diff -u "$OUTPUT_FILE" "$TMP_FILE" || true
    echo
    echo "   Please run:"
    echo "     npm run licenses"
    exit 1
  else
    echo "✅  $OUTPUT_FILE is up to date."
  fi
else
  echo "♻️  Generating $OUTPUT_FILE..."
  generate > "$OUTPUT_FILE"
  echo "✅  $OUTPUT_FILE has been updated."
fi
