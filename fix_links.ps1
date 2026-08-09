$path = 'src\components\Navbar.jsx'
$content = [System.IO.File]::ReadAllText($path)
$content = $content.Replace('Link to=', 'Link href=')
$content = $content.Replace('to={`/${', 'href={`/${')
$content = $content.Replace("to={`/", "href={`/")
[System.IO.File]::WriteAllText($path, $content)
Write-Host "Done replacing"
