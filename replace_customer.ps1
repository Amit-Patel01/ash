# Replace customer with student in frontend source files
$ErrorActionPreference = 'SilentlyContinue'
$root = "D:\GithubClone\solutionhub\frontend\src"

$files = Get-ChildItem -Path $root -Recurse -Include "*.jsx","*.js" | 
  Where-Object { $_.FullName -notmatch 'node_modules|graphify-out|\.git|dist|build|\.next|\.chrome-test-5' } |
  Select-Object -ExpandProperty FullName

Write-Host "Processing $($files.Count) files..."

# Collect renames
$renameMap = @{
  "AdminCustomers.jsx" = "AdminStudents.jsx"
  "CustomerLayout.jsx" = "StudentLayout.jsx"
  "CustomerMyCourses.jsx" = "StudentMyCourses.jsx"
  "CustomerOrders.jsx" = "StudentOrders.jsx"
  "CustomerOverview.jsx" = "StudentOverview.jsx"
  "CustomerProfile.jsx" = "StudentProfile.jsx"
  "CustomerCertificates.jsx" = "StudentCertificates.jsx"
  "CustomerSupport.jsx" = "StudentSupport.jsx"
  "CustomerSignup.jsx" = "StudentSignup.jsx"
}

# First pass: content replacements
foreach ($file in $files) {
  $content = Get-Content $file -Raw -Encoding UTF8
  $original = $content
  
  # Replace "Customer" with "Student" but NOT in protected terms
  # We use a temp placeholder for protected terms
  $protected = @(
    'customer_name',
    'customer_email',
    'customer_phone',
    'customer_uid',
    '/customer/',
    '/customers/',
    "'customer'",
    '"customer"',
    '`customer`',
    'registerCustomer',
    'register-customer',
    'AdminCustomers',
    'CustomerDashboard',
    'CustomerLayout',
    'CustomerOrders',
    'CustomerOverview',
    'CustomerSupport',
    'CustomerProfile',
    'CustomerCertificates',
    'CustomerMyCourses',
    'CustomerSignup'
  )
  
  foreach ($term in $protected) {
    $placeholder = "___PROTECTED_$($term -replace '[^a-zA-Z0-9]','_')___"
    $content = $content -replace [regex]::Escape($term), $placeholder
  }
  
  # Now do the replacements
  # Customer -> Student (capitalized)
  $content = $content -replace '(?<!\w)Customer(?!\w)', 'Student'
  # customer -> student (lowercase) - avoid already replaced/student
  $content = $content -replace '(?<!\w)customer(?!\w)', 'student'
  # customers -> students
  $content = $content -replace '(?<!\w)customers(?!\w)', 'students'
  # CUSTOMER -> STUDENT
  $content = $content -replace '(?<!\w)CUSTOMER(?!\w)', 'STUDENT'
  
  # Restore protected terms, but with student replacements where appropriate
  foreach ($term in $protected) {
    $placeholder = "___PROTECTED_$($term -replace '[^a-zA-Z0-9]','_')___"
    # For protected terms that are file/component names, rename them too
    if ($renameMap.ContainsKey($term)) {
      $content = $content -replace [regex]::Escape($placeholder), $renameMap[$term]
    } elseif ($term -match 'registerCustomer|register-customer|AdminCustomers') {
      # Keep these exactly as backend expects
      $content = $content -replace [regex]::Escape($placeholder), $term
    } elseif ($term -match 'customer_name|customer_email|customer_phone|customer_uid') {
      # Keep DB field names
      $content = $content -replace [regex]::Escape($placeholder), $term
    } elseif ($term -match '/customer/|/customers/') {
      # Keep paths
      $content = $content -replace [regex]::Escape($placeholder), $term
    } elseif ($term -match "'customer'|""customer""|`customer`") {
      # Keep role strings
      $content = $content -replace [regex]::Escape($placeholder), $term
    } else {
      $content = $content -replace [regex]::Escape($placeholder), $term
    }
  }
  
  if ($content -ne $original) {
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Updated: $file"
  }
}

Write-Host "`nContent replacements done.`n"

# Rename files
$renamedFiles = @{}
foreach ($kv in $renameMap.GetEnumerator()) {
  $oldName = $kv.Key
  $newName = $kv.Value
  $oldPath = Join-Path $root $oldName
  $newPath = Join-Path $root $newName
  
  if (Test-Path $oldPath) {
    Rename-Item -Path $oldPath -NewName $newName
    $renamedFiles[$oldName] = $newName
    Write-Host "Renamed: $oldName -> $newName"
  }
}

Write-Host "`nFile renames done.`n"

# Second pass: update imports
foreach ($file in $files) {
  $content = Get-Content $file -Raw -Encoding UTF8
  $original = $content
  
  foreach ($kv in $renameMap.GetEnumerator()) {
    $old = $kv.Key
    $new = $kv.Value
    $content = $content -replace [regex]::Escape($old), $new
  }
  
  # Also fix CustomerDashboard -> StudentDashboard if it appears as import
  $content = $content -replace 'CustomerDashboard', 'StudentDashboard'
  
  if ($content -ne $original) {
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "Updated imports: $file"
  }
}

Write-Host "`nAll done!"
