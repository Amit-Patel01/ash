# Add 'export const dynamic = force-dynamic' to all app page files after 'use client'
$files = Get-ChildItem -Path 'app' -Recurse -Include 'page.jsx'

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Only add if missing
    if ($content -notmatch "export const dynamic") {
        if ($content -match "^'use client'") {
            $content = $content -replace "^'use client'\r?\n", "'use client'`r`nexport const dynamic = 'force-dynamic'`r`n"
        } else {
            $content = "export const dynamic = 'force-dynamic'`r`n" + $content
        }
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Added dynamic: $($file.FullName.Replace((Get-Location).Path+'\',''))"
    }
}

Write-Host "Done!"
