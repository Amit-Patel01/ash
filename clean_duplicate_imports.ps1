# Clean up duplicate Link imports and remove react-router-dom Link imports

$files = Get-ChildItem -Path 'src' -Recurse -Include '*.jsx','*.js' | Where-Object { $_.FullName -notmatch 'legacy_backup' }

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content

    # Remove any import of Link from react-router-dom
    # Matches: import { Link } from 'react-router-dom'; or import { Link, ... } from 'react-router-dom';
    $content = $content -replace "import \{ Link \} from ['""]react-router-dom['""];?\r?\n?", ""
    $content = $content -replace "import \{ Link,\s*", "import { "
    $content = $content -replace ",\s*Link\s*\}", " }"
    $content = $content -replace ",\s*Link\s*,", ", "

    # Remove empty react-router-dom import lines
    $content = $content -replace "import \{\s*\} from ['""]react-router-dom['""];?\r?\n?", ""

    # Ensure only ONE import Link from 'next/link'
    $linkMatches = [regex]::Matches($content, "import Link from ['""]next/link['""];?\r?\n?")
    if ($linkMatches.Count -gt 1) {
        # Keep first, remove subsequent
        for ($i = 1; $i -lt $linkMatches.Count; $i++) {
            $content = $content.Replace($linkMatches[$i].Value, "")
        }
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Cleaned duplicate imports in: $($file.Name)"
    }
}

Write-Host "Duplicate import cleanup complete!"
