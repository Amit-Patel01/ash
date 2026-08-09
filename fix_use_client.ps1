# Add 'use client' to all JSX/JS files in src/ that use React hooks or browser APIs
# Also remove remaining react-router-dom imports

$dirs = @('src\admin', 'src\user', 'src\employee', 'src\views', 'src\components', 'src\context', 'src\store', 'src\editing', 'src\technicalsupport', 'src\web-service')

$hookPatterns = @('useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useContext', 'useReducer', 'useRouter', 'usePathname', 'useSearchParams')

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) { continue }
    
    $files = Get-ChildItem -Path $dir -Recurse -Include '*.jsx', '*.js'
    
    foreach ($file in $files) {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $original = $content
        
        # Remove leftover useNavigate from react-router-dom
        $content = $content -replace "import \{ useNavigate \} from 'react-router-dom'\r?\n?", ""
        $content = $content -replace 'import \{ useNavigate \} from "react-router-dom"\r?\n?', ""
        
        # Remove leftover useLocation from react-router-dom  
        $content = $content -replace "import \{ useLocation \} from 'react-router-dom'\r?\n?", ""
        
        # Remove leftover useParams from react-router-dom
        $content = $content -replace "import \{ useParams \} from 'react-router-dom'\r?\n?", ""
        
        # Remove remaining NavLink, Outlet from react-router-dom import lines
        $content = $content -replace "import \{ NavLink \} from 'react-router-dom'\r?\n?", ""
        $content = $content -replace "import \{ Outlet \} from 'react-router-dom'\r?\n?", ""
        
        # Remove empty react-router-dom import lines
        $content = $content -replace "import \{  \} from 'react-router-dom'\r?\n?", ""
        $content = $content -replace "import \{ \} from 'react-router-dom'\r?\n?", ""
        
        # Add 'use client' if missing and file uses hooks
        $needsClient = $false
        foreach ($hook in $hookPatterns) {
            if ($content -match $hook) {
                $needsClient = $true
                break
            }
        }
        # Also check for JSX and browser APIs
        if ($content -match 'onClick|onChange|onSubmit|window\.|document\.' ) {
            $needsClient = $true
        }
        
        if ($needsClient -and $content -notmatch "^'use client'") {
            $content = "'use client'`r`n" + $content
        }
        
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content)
            Write-Host "Fixed: $($file.Name)"
        }
    }
}

Write-Host "`nAll src/ files fixed!"
