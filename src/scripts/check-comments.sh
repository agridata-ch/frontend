#!/usr/bin/env bash
set -euo pipefail

changed_files=$(
  {
    git diff --name-only --diff-filter=AC --staged
    git diff --name-only --diff-filter=AC origin/develop...HEAD
  } | sort -u
)

if date --version >/dev/null 2>&1; then
    today=$(date +%s)
else
    today=$(date -j +%s)
fi

errors=()

REPO_ROOT=$(git rev-parse --show-toplevel)
for file in $changed_files; do
    file="$REPO_ROOT/$file"

    if [[ -f "$file" ]]; then
        content=$(cat "$file")
    else
        continue
    fi

    reviewed_date=$(echo "$content" | grep -oE 'CommentLastReviewed: +[0-9]{4}-[0-9]{2}-[0-9]{2}' | awk '{print $2}' || true)

    if [[ -z "$reviewed_date" ]]; then
        continue
    fi

    if date --version >/dev/null 2>&1; then
        reviewed_sec=$(date -d "$reviewed_date" +%s 2>/dev/null || true)
    else
        reviewed_sec=$(date -j -f "%Y-%m-%d" "$reviewed_date" +%s 2>/dev/null || true)
    fi

    if [[ -z "$reviewed_sec" ]]; then
        continue
    fi

    diff_days=$(( (today - reviewed_sec) / 86400 ))

    if (( diff_days > 7 )); then
        errors+=("$file: File was just created, but CommentLastReviewed ($reviewed_date) is older than 7 days. Please review the comment and update the review date.")
    fi
done

if (( ${#errors[@]} > 0 )); then
    echo "❌ Comment Review Check failed:"
    for err in "${errors[@]}"; do
        echo "  - $err"
    done
    exit 1
else
    echo "✅ Comment Review Check succeeded"
fi
