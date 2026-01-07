#!/bin/bash
# Example: Check if a service is running and healthy
# Copy to $VERIFY_SESSION/service-health.sh and customize

URL="${1:-http://localhost:3000/health}"
TIMEOUT="${2:-5}"

if curl -sf --max-time "$TIMEOUT" "$URL" > /dev/null 2>&1; then
    echo "PASS: Service responding at $URL"
else
    echo "FAIL: Service not responding at $URL"
    exit 1
fi
