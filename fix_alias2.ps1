# Fix all app router pages: replace relative ../src/ paths with @/src/ alias
$files = Get-ChildItem -Path 'app' -Recurse -Include 'page.jsx', 'not-found.jsx', 'layout.jsx'

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Replace broken @/components/ (missing src/) → @/src/components/
    $content = $content.Replace("'@/components/", "'@/src/components/")
    $content = $content.Replace('"@/components/', '"@/src/components/')
    
    # Replace broken @/views/ → @/src/views/
    $content = $content.Replace("'@/views/", "'@/src/views/")
    $content = $content.Replace('"@/views/', '"@/src/views/')

    # Replace broken @/admin/ → @/src/admin/
    $content = $content.Replace("'@/admin/", "'@/src/admin/")
    $content = $content.Replace('"@/admin/', '"@/src/admin/')
    
    # Replace broken @/user/ → @/src/user/
    $content = $content.Replace("'@/user/", "'@/src/user/")
    $content = $content.Replace('"@/user/', '"@/src/user/')

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed @/ alias paths: $($file.Name) at $($file.DirectoryName.Replace((Get-Location).Path, ''))"
    }
}
Write-Host "All @/ alias path fixes done!"
