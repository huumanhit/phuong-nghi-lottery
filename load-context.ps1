# Load AI context files and combine them

$files = @(
    "ai-context/PROJECT_CONTEXT.md",
    "ai-context/ARCHITECTURE.md",
    "ai-context/CODE_GUIDELINES.md",
    "ai-context/CURRENT_TASK.md"
)

$context = ""

foreach ($file in $files) {

    if (Test-Path $file) {

        $name = Split-Path $file -Leaf

        $context += "`n====================`n"
        $context += "$name`n"
        $context += "====================`n"

        $context += Get-Content $file -Raw
        $context += "`n"

    }

}

# Copy to clipboard
$context | Set-Clipboard

Write-Host ""
Write-Host "AI context copied to clipboard!" -ForegroundColor Green
Write-Host "Paste it into Claude." -ForegroundColor Yellow