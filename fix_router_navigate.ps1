# Update const navigate = useRouter() in all src files to smart navigate wrapper
$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx','*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Replace const navigate = useRouter()
    if ($content -match 'const navigate = useRouter\(\)') {
        $replacement = @"
  const router = useRouter()
  const navigate = (path, options) => {
    if (typeof path === 'number') router.back()
    else if (options?.replace) router.replace(path)
    else router.push(path)
  }
  navigate.push = (path) => router.push(path)
  navigate.replace = (path) => router.replace(path)
"@
        $content = $content.Replace('const navigate = useRouter()', $replacement)
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated router navigate wrapper in: $($file.Name)"
    }
}

Write-Host "Smart navigate wrapper update complete!"
