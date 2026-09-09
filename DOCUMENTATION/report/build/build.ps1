# Builds the final year report from Markdown sources.
#
# The project is still under development, so the report is version-controlled
# Markdown rebuilt on demand rather than hand-edited in Word.
#
# Usage:
#   .\build.ps1            build both PDF and DOCX
#   .\build.ps1 -Pdf       PDF only
#   .\build.ps1 -Docx      DOCX only (for supervisor markup)
#
# Requires: Pandoc, MiKTeX (xelatex). Both verified present 2026-07-29.

param(
    [switch]$Pdf,
    [switch]$Docx
)

$ErrorActionPreference = "Stop"

# Pandoc and MiKTeX were installed after this shell's PATH was captured, and a
# terminal opened before the install will not see them. Re-read PATH from the
# registry so the build works in any shell.
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [Environment]::GetEnvironmentVariable("Path", "User")

# Pandoc's Windows installer can be present before its PATH registration is
# visible to this shell or registry profile. Keep the build reproducible on
# the project workstation without requiring a machine-wide PATH edit.
$pandocHome = Join-Path $env:LOCALAPPDATA "Pandoc"
if (Test-Path (Join-Path $pandocHome "pandoc.exe")) { $env:Path += ";$pandocHome" }
$miktexBin = Join-Path $env:LOCALAPPDATA "Programs\MiKTeX\miktex\bin\x64"
if (Test-Path (Join-Path $miktexBin "xelatex.exe")) { $env:Path += ";$miktexBin" }

foreach ($tool in @("pandoc")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "$tool not found on PATH. Install it, then reopen the terminal."
    }
}

$buildDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$reportDir = Split-Path -Parent $buildDir
$outDir    = Join-Path $reportDir "out"

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

# Build both unless one was named explicitly.
if (-not $Pdf -and -not $Docx) { $Pdf = $true; $Docx = $true }
if ($Pdf -and -not (Get-Command xelatex -ErrorAction SilentlyContinue)) {
    throw "xelatex not found on PATH. Install it, then reopen the terminal."
}

# Chapter order matters. Preliminaries carry roman numerals, Chapter One
# restarts arabic numbering.
$chapters = @(
    "00-preliminaries.md"
    "01-introduction.md"
    "02-literature-review.md"
    "03-methodology.md"
    "04-data-analysis.md"
    "05-requirements.md"
    "06-system-design.md"
    "07-implementation-testing.md"
    "08-conclusion.md"
    "09-references.md"
    "10-appendices.md"
)

$sources = @()
foreach ($c in $chapters) {
    $p = Join-Path $reportDir $c
    if (Test-Path $p) { $sources += $p }
    else { Write-Host "  skipping $c (not written yet)" }
}

if ($sources.Count -eq 0) { throw "No chapter sources found in $reportDir" }

Push-Location $reportDir
try {
    $common = @(
        (Join-Path $reportDir "metadata.yaml")
        $sources
        "--from=markdown+smart"
        "--citeproc"
        # No --number-sections: section numbers are literal text in the
        # headings so the template's numbering gaps survive. See D2.
        # No --toc either: 00-preliminaries.md places the contents, figures
        # and tables lists itself, in the department's required page order.
        "--toc-depth=3"
        "--resource-path=.;$reportDir;$(Join-Path (Split-Path -Parent $reportDir) 'diagrams/png')"
    )

    if ($Pdf) {
        Write-Host "Building PDF..."
        $pdfArgs = $common + @(
            "--pdf-engine=xelatex"
            "--include-in-header=$(Join-Path $buildDir 'headings-black.tex')"
            "--top-level-division=chapter"
            "-o", (Join-Path $outDir "Changia-FYP-Report.pdf")
        )
        & pandoc @pdfArgs
        if ($LASTEXITCODE -ne 0) { throw "PDF build failed" }
        Write-Host "  -> out/Changia-FYP-Report.pdf"
    }

    if ($Docx) {
        Write-Host "Building DOCX..."
        $docxArgs = $common + @("-o", (Join-Path $outDir "Changia-FYP-Report-Final.docx"))
        $ref = Join-Path $buildDir "reference.docx"
        if (Test-Path $ref) { $docxArgs += "--reference-doc=$ref" }
        else { Write-Host "  note: no reference.docx, using Pandoc defaults" }
        & pandoc @docxArgs
        if ($LASTEXITCODE -ne 0) { throw "DOCX build failed" }
        Write-Host "  -> out/Changia-FYP-Report-Final.docx"
    }
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "Done."
