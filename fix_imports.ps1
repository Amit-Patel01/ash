# Fix all remaining react-router-dom imports - add next/navigation imports
$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx', '*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

$nextNavImports = @('useRouter', 'usePathname', 'useSearchParams', 'useParams')

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Check if file still has react-router-dom imports
    if ($content -match "from 'react-router-dom'") {
        # Extract what's imported from react-router-dom
        $hasUseNavigate = $content -match 'useNavigate'
        $hasUseLocation = $content -match 'useLocation'
        $hasUseParams = $content -match 'useParams'
        $hasNavLink = $content -match 'NavLink'
        $hasOutlet = $content -match 'Outlet'
        $hasRoute = $content -match '\bRoute\b'
        $hasRoutes = $content -match '\bRoutes\b'

        # Build next/navigation import if needed
        $nextImports = @()
        if ($hasUseNavigate -and $content -notmatch "from 'next/navigation'") { $nextImports += 'useRouter' }
        if ($hasUseLocation -and $content -notmatch "from 'next/navigation'") { $nextImports += 'usePathname' }
        if ($hasUseParams -and $content -notmatch "from 'next/navigation'") { $nextImports += 'useParams' }

        if ($nextImports.Count -gt 0) {
            $nextImportStr = "import { $($nextImports -join ', ') } from 'next/navigation'"
            # Add after first import line
            $content = $content -replace "(^import .+\n)", "`$1$nextImportStr`n"
        }

        # Remove pure react-router-dom import lines that only have router hooks (not components)
        $content = $content -replace "import \{ useNavigate(?:, useLocation)? \} from 'react-router-dom'\n?", ""
        $content = $content -replace "import \{ useLocation(?:, useNavigate)? \} from 'react-router-dom'\n?", ""
        $content = $content -replace "import \{ useParams \} from 'react-router-dom'\n?", ""
        
        # For lines with both components and hooks, remove just the hooks
        $content = $content -replace ", useNavigate", ""
        $content = $content -replace ", useLocation", ""
        $content = $content -replace ", useParams", ""
        $content = $content -replace "useNavigate, ", ""
        $content = $content -replace "useLocation, ", ""
        $content = $content -replace "useParams, ", ""
        
        # Remove NavLink (replace with Link)
        $content = $content -replace ", NavLink", ""
        $content = $content -replace "NavLink, ", ""
        $content = $content.Replace("NavLink", "Link")
        
        # Remove Outlet
        $content = $content -replace ", Outlet", ""
        $content = $content -replace "Outlet, ", ""
        $content = $content.Replace("<Outlet />", "{children}")
        
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content)
            Write-Host "Fixed router-dom imports: $($file.FullName)"
        }
    }
}
Write-Host "Router import fixes done!"
