# Fix all React Router Link → Next.js Link across all src files
$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx', '*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content
    
    # Replace react-router-dom Link import with next/link
    $content = $content -replace "import \{ Link \} from 'react-router-dom'", "import Link from 'next/link'"
    $content = $content -replace 'import \{ Link \} from "react-router-dom"', 'import Link from "next/link"'
    
    # Replace Link to= with Link href=
    $content = $content.Replace('Link to=', 'Link href=')
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed: $($file.FullName)"
    }
}
Write-Host "All done!"
