# Replace hardcoded window.location.pathname with usePathname() hook in layouts and components

$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx','*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    if ($content -match "const _loc = \{ pathname: typeof window !== 'undefined' \? window\.location\.pathname : '' \}; const location = _loc") {
        $replacement = "const pathname = usePathname() || ''; const location = { pathname }"
        $content = $content.Replace("const _loc = { pathname: typeof window !== 'undefined' ? window.location.pathname : '' }; const location = _loc", $replacement)
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed layout pathname in: $($file.Name)"
    }
}

Write-Host "Layout pathname fix complete!"
