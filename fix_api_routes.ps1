# Add export const dynamic = 'force-dynamic' to all API route.js files
$files = Get-ChildItem -Path 'app\api' -Recurse -Include 'route.js'

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    if ($content -notmatch "export const dynamic") {
        $content = "export const dynamic = 'force-dynamic';`r`n" + $content
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Added force-dynamic to API route: $($file.FullName.Replace((Get-Location).Path+'\',''))"
    }
}

Write-Host "API route dynamic export setup complete!"
