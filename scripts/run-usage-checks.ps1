# Usage: .\scripts\run-usage-checks.ps1  (run from repo root)

$ErrorActionPreference = 'Continue'
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$dateSlug  = Get-Date -Format 'yyyy-MM-dd'

$checksFile  = Join-Path $PSScriptRoot 'usage-checks.json'
$runningFile = Join-Path $PSScriptRoot 'usage-report.csv'
$datedFile   = Join-Path $PSScriptRoot "usage-report-$dateSlug.csv"

$config = Get-Content $checksFile -Raw | ConvertFrom-Json
$db     = $config.db

$header = 'timestamp,id,category,name,value,limit,limit_unit,status,notes'

function ConvertTo-CsvField($s) {
    $s = [string]$s
    if ($s -match '[,"\r\n]') { '"' + $s.Replace('"', '""') + '"' } else { $s }
}

$rows = [System.Collections.Generic.List[string]]::new()

foreach ($check in $config.checks) {
    $value     = ''
    $status    = 'ok'
    $notes     = if ($check.PSObject.Properties['note']) { $check.note } else { '' }
    $limitVal  = if ($null -ne $check.limit) { $check.limit } else { '' }
    $limitUnit = if ($check.PSObject.Properties['limit_unit']) { $check.limit_unit } else { '' }

    if ($check.type -eq 'd1_query') {
        try {
            $rawLines = npx wrangler d1 execute $db --remote --command $check.command
            $raw = $rawLines -join "`n"

            $jsonStart = $raw.IndexOf('[')
            if ($jsonStart -ge 0) {
                $parsed  = $raw.Substring($jsonStart) | ConvertFrom-Json
                $results = $parsed[0].results
                if ($results.Count -eq 0) {
                    $value = '0'
                } elseif ($results.Count -eq 1) {
                    $value = [string]$results[0].value
                } else {
                    $value = ($results | ForEach-Object { [string]$_.value }) -join '; '
                }
            } else {
                $value  = 'PARSE_ERROR'
                $status = 'error'
                $notes  = 'Could not find JSON in wrangler output'
            }

            if ($status -eq 'ok' -and $limitVal -ne '' -and $value -match '^[\d.]+$') {
                if ([double]$value -ge [double]$limitVal) { $status = 'WARNING' }
            }
        } catch {
            $value  = 'ERROR'
            $status = 'error'
            $notes  = ($_.Exception.Message -replace '\r?\n', ' ')
        }
    } elseif ($check.type -eq 'manual') {
        $value  = 'manual'
        $status = 'manual'
        if ($check.PSObject.Properties['dashboard_path']) { $notes = $check.dashboard_path }
        $limitVal = ''
    } else {
        $value  = 'skipped'
        $status = 'skipped'
    }

    $row = "$(ConvertTo-CsvField $timestamp),$(ConvertTo-CsvField $check.id),$(ConvertTo-CsvField $check.category),$(ConvertTo-CsvField $check.name),$(ConvertTo-CsvField $value),$(ConvertTo-CsvField $limitVal),$(ConvertTo-CsvField $limitUnit),$(ConvertTo-CsvField $status),$(ConvertTo-CsvField $notes)"
    $rows.Add($row)

    $limitDisplay = if ($limitVal -ne '') { " / $limitVal" } else { '' }
    Write-Host "  [$status] $($check.id): $value$limitDisplay $limitUnit"
}

# Dated snapshot — overwrite (one snapshot per day)
Set-Content -Path $datedFile -Value ($header + "`n" + ($rows -join "`n")) -Encoding utf8
Write-Host "`nDated:   $datedFile"

# Running log — append
if (-not (Test-Path $runningFile)) {
    Set-Content -Path $runningFile -Value $header -Encoding utf8
}
Add-Content -Path $runningFile -Value ($rows -join "`n") -Encoding utf8
Write-Host "Running: $runningFile"
