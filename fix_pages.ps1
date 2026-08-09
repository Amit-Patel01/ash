# Fix all app router pages:
# 1. Remove metadata exports (can't be in 'use client' files)
# 2. Ensure proper format: 'use client' first, then imports, then dynamic, then component

$files = Get-ChildItem -Path 'app' -Recurse -Include 'page.jsx', 'layout.jsx' | Where-Object { $_.Name -ne 'not-found.jsx' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Remove metadata export blocks (multi-line)
    $content = $content -replace "export const metadata = \{[^}]+\}\r?\n?", ""
    
    # Remove 'use client' if it's not the first line
    $content = $content -replace "(?m)^'use client'\r?\n", ""
    $content = $content.TrimStart()
    
    # Fix: dynamic must come after imports - remove it from top if before imports
    $content = $content -replace "^export const dynamic = 'force-dynamic'\r?\n", ""
    $content = $content.TrimStart()
    
    # Add proper header
    if ($file.Name -eq 'layout.jsx') {
        # layout.jsx should NOT have 'use client' (it's a server component)
        if ($content -notmatch "^export const dynamic") {
            # Don't add dynamic to layout
        }
    } else {
        # All page.jsx files: add 'use client' at top
        if ($content -notmatch "^'use client'") {
            $content = "'use client'`r`n" + $content
        }
    }
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed format: $($file.Name) at $($file.DirectoryName.Replace((Get-Location).Path,''))"
    }
}

Write-Host "`nAll page format fixes done!"
