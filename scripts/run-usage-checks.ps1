# Usage: .\scripts\run-usage-checks.ps1  (run from repo root)

$timestamp   = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$dateSlug    = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$config      = Get-Content "$PSScriptRoot\usage-checks.json" -Raw | ConvertFrom-Json
$db          = $config.db
$utf8        = New-Object System.Text.UTF8Encoding $false
$header      = 'timestamp,images,db_size_kb,users,rsvp_total,rsvp_confirmed,questions_unanswered'
$runningFile = "$PSScriptRoot\usage-report.csv"
$datedFile   = "$PSScriptRoot\usage-report-$dateSlug.csv"

function Invoke-D1Query($query) {
    $raw    = (npx wrangler d1 execute $db --remote --command $query) -join "`n"
    $start  = $raw.IndexOf('[')
    $parsed = $raw.Substring($start) | ConvertFrom-Json
    return $parsed[0]
}

$r1 = Invoke-D1Query $config.queries.images
$r2 = Invoke-D1Query $config.queries.users
$r3 = Invoke-D1Query $config.queries.rsvp_confirmed
$r4 = Invoke-D1Query $config.queries.rsvp_total
$r5 = Invoke-D1Query $config.queries.questions_unanswered

$images               = $r1.results[0].value
$db_size_kb           = [math]::Round($r1.meta.size_after / 1KB, 1)
$users                = $r2.results[0].value
$rsvp_confirmed       = $r3.results[0].value
$rsvp_total           = $r4.results[0].value
$questions_unanswered = $r5.results[0].value

$row = "$timestamp,$images,$db_size_kb,$users,$rsvp_total,$rsvp_confirmed,$questions_unanswered"

Write-Host "timestamp:            $timestamp"
Write-Host "images:               $images"
Write-Host "db_size_kb:           $db_size_kb"
Write-Host "users:                $users"
Write-Host "rsvp_total:           $rsvp_total"
Write-Host "rsvp_confirmed:       $rsvp_confirmed"
Write-Host "questions_unanswered: $questions_unanswered"

if (-not (Test-Path $runningFile)) {
    [System.IO.File]::WriteAllText($runningFile, $header + "`n", $utf8)
}
[System.IO.File]::AppendAllText($runningFile, $row + "`n", $utf8)

[System.IO.File]::WriteAllText($datedFile, $header + "`n" + $row + "`n", $utf8)

Write-Host "`nDated:   $datedFile"
Write-Host "Running: $runningFile"
