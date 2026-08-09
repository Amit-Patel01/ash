# Fix import paths in all new app router pages
# app/<dirname>/page.jsx needs ../../src/ not ../src/
$files = Get-ChildItem -Path 'app' -Recurse -Include 'page.jsx' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Calculate depth: app/dirname/page.jsx = depth 2 from root
    # Relative path to src/ from app/dirname/ = ../../src/
    # But some pages are app/dirname/subdirname/page.jsx = depth 3 = ../../../src/
    
    $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
    $parts = $relativePath.Split('\')
    $depth = $parts.Length - 1  # subtract page.jsx itself
    
    $prefix = '../' * $depth
    
    # Fix wrong relative paths to src/
    if ($content -match "\.\./src/") {
        # Replace all occurrences of ../src/ with correct prefix + src/
        $content = $content -replace "\.\./src/", "${prefix}src/"
        
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content)
            Write-Host "Fixed paths (depth=$depth): $relativePath"
        }
    }
}
Write-Host "All path fixes done!"
