# Scan all src files and ensure useRouter, useSearchParams, usePathname, useParams are imported from 'next/navigation'
# And Link is imported from 'next/link'

$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx','*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    $neededNavImports = @()
    if ($content -match '\buseRouter\s*\(' -and $content -notmatch "useRouter.*from ['""]next/navigation['""]") {
        $neededNavImports += 'useRouter'
    }
    if ($content -match '\buseSearchParams\s*\(' -and $content -notmatch "useSearchParams.*from ['""]next/navigation['""]") {
        $neededNavImports += 'useSearchParams'
    }
    if ($content -match '\busePathname\s*\(' -and $content -notmatch "usePathname.*from ['""]next/navigation['""]") {
        $neededNavImports += 'usePathname'
    }
    if ($content -match '\buseParams\s*\(' -and $content -notmatch "useParams.*from ['""]next/navigation['""]") {
        $neededNavImports += 'useParams'
    }

    # Clean react-router-dom imports of useSearchParams, useParams, useNavigate, useLocation
    $content = $content -replace "import \{([^}]*)\buseSearchParams\b([^}]*)\} from ['""]react-router-dom['""]", "import {$1$2} from 'react-router-dom'"
    $content = $content -replace "import \{([^}]*)\buseParams\b([^}]*)\} from ['""]react-router-dom['""]", "import {$1$2} from 'react-router-dom'"
    $content = $content -replace "import \{([^}]*)\buseNavigate\b([^}]*)\} from ['""]react-router-dom['""]", "import {$1$2} from 'react-router-dom'"
    $content = $content -replace "import \{([^}]*)\buseLocation\b([^}]*)\} from ['""]react-router-dom['""]", "import {$1$2} from 'react-router-dom'"

    # Fix cleanup artifacts like import { , Link } or import { Link, }
    $content = $content -replace "import \{\s*,\s*", "import { "
    $content = $content -replace ",\s*\}", " }"
    $content = $content -replace "import \{\s*\} from ['""]react-router-dom['""]\r?\n?", ""

    # Insert missing next/navigation import
    if ($neededNavImports.Count -gt 0) {
        $navImportStr = "import { " + ($neededNavImports -join ', ') + " } from 'next/navigation'"
        # Add after 'use client' or top import
        if ($content -match "^'use client'") {
            $content = $content -replace "^'use client'\r?\n", "'use client'`r`n$navImportStr`r`n"
        } else {
            $content = "$navImportStr`r`n" + $content
        }
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed navigation imports in: $($file.Name)"
    }
}

Write-Host "Navigation import scan complete!"
