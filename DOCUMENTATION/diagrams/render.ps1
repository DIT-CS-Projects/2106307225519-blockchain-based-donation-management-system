# Renders every Mermaid source in this folder to PNG.
#
# Mermaid sources are the single source of truth for diagram structure
# (DELIVERABLES_SYNC.md S2). The report embeds these PNGs directly; the deck
# embeds the same PNGs. Three deck diagrams are exceptions drawn as native
# PowerPoint shapes: architecture layers, working-system flowchart, use case.
#
# Usage:
#   .\render.ps1              render all .mmd files
#   .\render.ps1 -Name erd    render only erd.mmd

param(
    [string]$Name = "*",
    [int]$Scale = 3
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$out = Join-Path $here "png"

if (-not (Test-Path $out)) { New-Item -ItemType Directory -Path $out | Out-Null }

$sources = Get-ChildItem -Path $here -Filter "$Name.mmd"

if ($sources.Count -eq 0) {
    Write-Host "No .mmd sources matched '$Name'."
    exit 0
}

$failed = @()

foreach ($src in $sources) {
    $target = Join-Path $out "$($src.BaseName).png"
    Write-Host "-> $($src.Name)"

    # -b white keeps diagrams legible regardless of the viewer's theme.
    # Scale 3 stays crisp on a projector and in print.
    & mmdc -i $src.FullName -o $target -c (Join-Path $here "theme.json") -s $Scale -b white

    if ($LASTEXITCODE -ne 0) { $failed += $src.Name }
}

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "FAILED: $($failed -join ', ')"
    exit 1
}

Write-Host ""
Write-Host "Rendered $($sources.Count) diagram(s) to $out"
