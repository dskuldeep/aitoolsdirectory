#!/bin/bash

# Script to add 'export const runtime = "edge"' to all route files
# for Cloudflare Pages compatibility

# Function to add edge runtime to a file if not already present
add_edge_runtime() {
    local file=$1
    
    # Check if file already has runtime export
    if ! grep -q "export const runtime" "$file"; then
        # Check file extension and add appropriate export
        if [[ $file == *.ts ]] || [[ $file == *.tsx ]]; then
            # Add after imports, before first export/function
            sed -i.bak '1a\
export const runtime = "edge"\
' "$file"
            rm "${file}.bak" 2>/dev/null
            echo "✓ Added edge runtime to: $file"
        fi
    else
        echo "  Skipped (already has runtime): $file"
    fi
}

# Find all admin pages
echo "Processing admin pages..."
find app/admin -name "page.tsx" -type f | while read file; do
    add_edge_runtime "$file"
done

# Find all API routes
echo "Processing API routes..."
find app/api -name "route.ts" -type f | while read file; do
    add_edge_runtime "$file"
done

# Add to specific dynamic pages
echo "Processing dynamic pages..."
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
        add_edge_runtime "$file"
    fi
done

echo ""
echo "✅ Edge runtime configuration complete!"
echo "All dynamic routes now configured for Cloudflare Pages Edge Runtime."

