# Ensure all files using <Link have import Link from 'next/link'

$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx','*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    if ($content -match '<Link\b' -and $content -notmatch "import Link from ['""]next/link['""]") {
        $linkImport = "import Link from 'next/link'"
        
        if ($content -match "^'use client'") {
            $content = $content -replace "^'use client'\r?\n", "'use client'`r`n$linkImport`r`n"
        } else {
            $content = "$linkImport`r`n" + $content
        }
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Added Link import to: $($file.Name)"
    }
}

Write-Host "Link import check complete!"
