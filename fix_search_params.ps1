# Replace const [searchParams] = useSearchParams() with const searchParams = useSearchParams()
# Also replace navigate.push or navigate(...) with router.push(...) or navigate.push(...)

$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx','*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Fix Next.js useSearchParams usage (object, not array)
    $content = $content -replace "const \[\s*searchParams\s*\] = useSearchParams\(\)", "const searchParams = useSearchParams()"

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed searchParams in: $($file.Name)"
    }
}

Write-Host "searchParams fix complete!"
