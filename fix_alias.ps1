# Fix all app router pages to use @/ alias instead of relative paths
$files = Get-ChildItem -Path 'app' -Recurse -Include 'page.jsx', 'not-found.jsx', 'layout.jsx'

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Replace any relative path to src/ with @/ alias
    # Matches: ../src/, ../../src/, ../../../src/, ../../../../src/
    $content = $content -replace '(\.\./)+src/', '@/'
    
    # Also fix relative paths to components/ in root
    $content = $content -replace '(\.\./)+components/', '@/components/'
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed alias: $($file.Name) at $($file.DirectoryName)"
    }
}
Write-Host "Alias fixes done!"
