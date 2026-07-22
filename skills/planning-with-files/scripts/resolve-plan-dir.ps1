# planning-with-files: resolve active plan directory (PowerShell mirror).
#
# Resolution order matches scripts/resolve-plan-dir.sh:
#   1. $env:PLAN_ID -> .\.planning\$PLAN_ID\
#   2. .\.planning\.active_plan content
#   3. Newest .\.planning\<dir>\ by LastWriteTime
#   4. Empty (legacy fallback to .\task_plan.md handled by caller)
#
# v3.8.0 parity with the sh resolver: slug validation on every branch, the
# newest-dir scan requires task_plan.md inside the candidate (a sessions/ or
# artifacts/ dir must never win), and containment fails CLOSED when
# canonicalization fails. Only successful canonicalization can rule out a
# junction/symlink escape; slug validation alone blocks textual traversal.

param(
    [string]$PlanRoot = (Join-Path (Get-Location) ".planning")
)

$projectRoot = (Get-Location).Path

# Same shape as the sh resolver's slug_is_valid: first char [A-Za-z0-9_],
# rest [A-Za-z0-9._-]. Blocks traversal tokens before any path is built.
function Test-ValidSlug {
    param([string]$Name)
    if (-not $Name) { return $false }
    return $Name -match '^[A-Za-z0-9_][A-Za-z0-9._-]*$'
}

# Containment guard (security A1.3): a resolved plan dir must canonicalize to
# a path under the project root. A directory symlink/junction inside a valid
# slug pointing outside the workspace would otherwise let the hooks hash and
# inject an arbitrary file. Resolve-Path follows reparse points; we compare
# the real paths. Fails CLOSED on canonicalization failure, matching
# resolve-plan-dir.sh.
function Test-WithinRoot {
    param([string]$Candidate)
    try {
        $rootReal = (Resolve-Path -LiteralPath $projectRoot -ErrorAction Stop).Path
        $candReal = (Resolve-Path -LiteralPath $Candidate -ErrorAction Stop).Path
    } catch {
        return $false
    }
    if (-not $rootReal -or -not $candReal) { return $false }
    $rootNorm = $rootReal.TrimEnd('\', '/')
    $candNorm = $candReal.TrimEnd('\', '/')
    if ($candNorm -eq $rootNorm) { return $true }
    return $candNorm.StartsWith($rootNorm + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)
}

$activeFile = Join-Path $PlanRoot ".active_plan"

if ($env:PLAN_ID) {
    if (Test-ValidSlug $env:PLAN_ID) {
        $candidate = Join-Path $PlanRoot $env:PLAN_ID
        if ((Test-Path $candidate -PathType Container) -and (Test-WithinRoot $candidate)) {
            Write-Output $candidate
            exit 0
        }
    }
}

if (Test-Path $activeFile) {
    $planId = (Get-Content $activeFile -Raw).Trim()
    if ($planId -and (Test-ValidSlug $planId)) {
        $candidate = Join-Path $PlanRoot $planId
        if ((Test-Path $candidate -PathType Container) -and (Test-WithinRoot $candidate)) {
            Write-Output $candidate
            exit 0
        }
    }
}

if (Test-Path $PlanRoot -PathType Container) {
    $latest = Get-ChildItem -Path $PlanRoot -Directory |
        Where-Object { -not $_.Name.StartsWith('.') } |
        Where-Object { Test-ValidSlug $_.Name } |
        Where-Object { Test-Path (Join-Path $_.FullName "task_plan.md") -PathType Leaf } |
        Where-Object { Test-WithinRoot $_.FullName } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if ($latest) {
        Write-Output $latest.FullName
    }
}

exit 0
