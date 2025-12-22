#!/bin/bash

# Script to fix the placement of 'export const runtime = "edge"'
# Move it after all imports

fix_runtime_placement() {
    local file=$1
    
    # Create a temporary file
    local temp_file="${file}.temp"
    
    # Read the file and reorganize
    python3 - "$file" "$temp_file" << 'PYTHON_SCRIPT'
import sys
import re

input_file = sys.argv[1]
output_file = sys.argv[2]

with open(input_file, 'r') as f:
    lines = f.readlines()

# Remove the misplaced runtime export
filtered_lines = [line for line in lines if 'export const runtime = "edge"' not in line]

# Find the position after all imports
last_import_index = -1
for i, line in enumerate(filtered_lines):
    if line.strip().startswith('import '):
        last_import_index = i

# Insert runtime export after last import
if last_import_index >= 0:
    filtered_lines.insert(last_import_index + 1, '\nexport const runtime = "edge"\n')
else:
    # No imports found, add at the beginning
    filtered_lines.insert(0, 'export const runtime = "edge"\n\n')

# Write the fixed content
with open(output_file, 'w') as f:
    f.writelines(filtered_lines)
PYTHON_SCRIPT
    
    # Replace original file
    mv "$temp_file" "$file"
    echo "✓ Fixed: $file"
}

# Process all files that were modified
echo "Fixing edge runtime placement..."

# Admin pages
find app/admin -name "page.tsx" -type f | while read file; do
    fix_runtime_placement "$file"
done

# API routes
find app/api -name "route.ts" -type f | while read file; do
    fix_runtime_placement "$file"
done

# Dynamic pages
for file in \
    app/blog/page.tsx \
    app/blog/[slug]/page.tsx \
    app/tools/page.tsx \
    app/tools/[slug]/page.tsx \
    app/feed.xml/route.ts \
    app/sitemap.ts \
    app/page.tsx \
    app/robots.ts; do
    if [ -f "$file" ]; then
        fix_runtime_placement "$file"
    fi
done

echo "✅ Edge runtime placement fixed!"

