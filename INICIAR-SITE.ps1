$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot 'frontend')
try { npm.cmd start } finally { Pop-Location }
