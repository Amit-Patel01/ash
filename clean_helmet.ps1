# Remove react-helmet-async and <Helmet> tags from all files

$files = Get-ChildItem -Path 'src','components' -Recurse -Include '*.jsx','*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Remove import of Helmet/HelmetProvider from react-helmet-async
    $content = $content -replace "import \{[^}]*Helmet[^}]*\} from ['""]react-helmet-async['""];?\r?\n?", ""

    # Remove <HelmetProvider> tags
    $content = $content -replace "<HelmetProvider>\r?\n?", ""
    $content = $content -replace "</HelmetProvider>\r?\n?", ""

    # Remove <Helmet>...</Helmet> blocks (multi-line)
    $content = $content -replace "(?s)<Helmet>.*?</Helmet>\r?\n?", ""

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Cleaned Helmet from: $($file.Name)"
    }
}

Write-Host "Helmet cleanup complete!"
