$ErrorActionPreference = 'Stop'
$pythonApi = Join-Path $PSScriptRoot 'backend/.venv/Scripts/python.exe'
if (-not (Test-Path -LiteralPath $pythonApi)) {
    throw 'Ambiente Python ausente. Consulte COMO-TESTAR-ALTERACOES.md para instalar.'
}
Push-Location (Join-Path $PSScriptRoot 'frontend')
try {
    npm.cmd run sync:catalog
    if ($LASTEXITCODE -ne 0) { throw 'Corrija o catálogo antes de iniciar a API.' }
} finally { Pop-Location }
Push-Location (Join-Path $PSScriptRoot 'backend')
try { & $pythonApi -m uvicorn server:app --host 127.0.0.1 --port 8000 } finally { Pop-Location }
