# Rewrite all app page files to use dynamic imports with ssr:false
# This completely prevents SSR crashes from auth/context during prerendering

$files = Get-ChildItem -Path 'app' -Recurse -Include 'page.jsx'

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    
    # Extract the Layout import path
    $layoutMatch = [regex]::Match($content, "import Layout from '([^']+)'")
    $layoutPath = if ($layoutMatch.Success) { $layoutMatch.Groups[1].Value } else { '@/src/components/Layout' }
    
    # Extract all view/component imports (non-next, non-react imports)
    $importMatches = [regex]::Matches($content, "import (\w+) from '(@/src[^']+)'")
    
    # Extract component name and path for view imports (not Layout)
    $dynamicImports = @()
    $componentName = ''
    $componentPath = ''
    
    foreach ($match in $importMatches) {
        $name = $match.Groups[1].Value
        $path = $match.Groups[2].Value
        if ($name -ne 'Layout') {
            $componentName = $name
            $componentPath = $path
            $dynamicImports += "const $name = dynamic(() => import('$path'), { ssr: false })"
        }
    }
    
    if ($componentName -eq '') { continue }
    
    # Build new file content
    $newContent = @"
'use client'
import dynamic from 'next/dynamic'

const Layout = dynamic(() => import('$layoutPath'), { ssr: false })
$($dynamicImports -join "`r`n")

export default function Page() {
  return (
    <Layout>
      <$componentName />
    </Layout>
  )
}
"@
    
    [System.IO.File]::WriteAllText($file.FullName, $newContent)
    Write-Host "Rewrote with ssr:false: $($file.FullName.Replace((Get-Location).Path+'\',''))"
}

Write-Host "`nAll pages rewritten with ssr:false!"
