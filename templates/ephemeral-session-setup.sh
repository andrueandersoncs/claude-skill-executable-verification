#!/bin/bash
# Ephemeral Verification Session Setup
# Run once per conversation to create a temp verification directory

set -e

export VERIFY_SESSION="/tmp/verify-$(date +%s)"
mkdir -p "$VERIFY_SESSION"

# Create the run-all entry point
cat > "$VERIFY_SESSION/run-all.sh" << 'RUNNER'
#!/bin/bash
# Runs all verification scripts in this session directory
cd "$(dirname "$0")"
failed=0
count=0

for script in *.sh; do
    [[ "$script" == "run-all.sh" ]] && continue
    [[ ! -f "$script" ]] && continue

    ((count++))
    echo "=== $script ==="
    if bash "$script"; then
        echo ""
    else
        echo ""
        failed=1
    fi
done

if [[ $count -eq 0 ]]; then
    echo "No verification scripts found"
    exit 0
fi

echo "=== Summary: $count scripts ==="
if [[ $failed -eq 0 ]]; then
    echo "All checks passed"
else
    echo "Some checks failed"
    exit 1
fi
RUNNER

chmod +x "$VERIFY_SESSION/run-all.sh"

echo "Ephemeral verification session created:"
echo "  Directory: $VERIFY_SESSION"
echo "  Run all:   \$VERIFY_SESSION/run-all.sh"
echo ""
echo "Add scripts like:"
echo "  echo '#!/bin/bash' > \$VERIFY_SESSION/my-check.sh"
echo "  echo 'curl -sf localhost:3000/health && echo PASS || exit 1' >> \$VERIFY_SESSION/my-check.sh"
