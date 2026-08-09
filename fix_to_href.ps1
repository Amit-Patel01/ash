# Fix ALL remaining React Router prop patterns in all src files
# Replace: to={...} with href={...}
# Replace: to="..." with href="..."  (already done but check)

$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx','*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Replace to={...} pattern (dynamic hrefs in JSX)
    # Pattern: to={expression}
    $content = [regex]::Replace($content, '\bto=\{', 'href={')
    
    # Replace remaining to="..." patterns  
    $content = [regex]::Replace($content, '\bto="', 'href="')
    
    # Replace to={`...`} template literals
    $content = [regex]::Replace($content, '\bto=\{`', 'href={`')

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed to->href: $($file.Name)"
    }
}

Write-Host "All to={} -> href={} fixes done!"
