#!/bin/sh
# Script to set up Git hooks for the project

HOOK_NAMES="pre-commit commit-msg"
echo "Setting up Git hooks..."

for hook in $HOOK_NAMES; do
    ln -s -f ../../git_hooks/$hook .git/hooks/$hook
done

echo "Git hooks set up successfully."
