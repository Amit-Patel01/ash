# Fix all useNavigate and useLocation usages across all src files
$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx', '*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # 1. Fix mixed imports: remove Link/useNavigate/useLocation from react-router-dom, keep others
    # Pattern: import { ..., Link, ... } from 'react-router-dom' → remove Link
    # Pattern: import { useNavigate, useLocation } from 'react-router-dom' → add next/navigation imports

    # Replace entire react-router-dom import lines that contain useNavigate or useLocation
    # (These need manual analysis, so we flag them)
    
    # Simple replacements
    $content = $content.Replace("useNavigate()", "useRouter()")
    $content = $content.Replace("const navigate = useNavigate", "const navigate = useRouter")
    $content = $content.Replace("const location = useLocation()", "const _loc = { pathname: typeof window !== 'undefined' ? window.location.pathname : '' }; const location = _loc")
    $content = $content.Replace("useLocation().pathname", "typeof window !== 'undefined' ? window.location.pathname : ''")

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed navigate/location: $($file.FullName)"
    }
}
Write-Host "Navigation fixes done!"
