# Add export const dynamic = 'force-dynamic' to all private dashboard pages
# These pages need auth context and can't be statically prerendered

$privatePagesPatterns = @(
    'app\admin',
    'app\employee', 
    'app\user',
    'app\checkout',
    'app\chat',
    'app\auth-callback',
    'app\role-select',
    'app\request-account',
    'app\student-signup',
    'app\signup',
    'app\login',
    'app\verify',
    'app\programs',
    'app\courses',
    'app\projects',
    'app\contact',
    'app\services',
    'app\about',
    'app\custom-project',
    'app\infrastructure',
    'app\help',
    'app\legal'
)

$files = Get-ChildItem -Path 'app' -Recurse -Include 'page.jsx'

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content
    
    # Add dynamic export if not already present
    if ($content -notmatch "export const dynamic") {
        # Insert after 'use client' line or at the beginning after imports
        if ($content -match "^'use client'") {
            $content = $content -replace "^'use client'\r?\n", "'use client'`r`nexport const dynamic = 'force-dynamic'`r`n"
        } else {
            # Add before the first import or default export
            $content = "export const dynamic = 'force-dynamic'`r`n" + $content
        }
        
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Added dynamic: $($file.FullName.Replace((Get-Location).Path + '\', ''))"
    }
}

Write-Host "`nDynamic routing fix done!"
