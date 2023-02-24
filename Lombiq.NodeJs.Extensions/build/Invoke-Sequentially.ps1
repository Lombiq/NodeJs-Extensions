param(
  [Parameter(Mandatory = $true, HelpMessage = 'The path to an existing file that will act as a lock between threads.')]
  [ValidateNotNullOrEmpty()]
  $LockFilePath,
  [Parameter(Mandatory = $true, HelpMessage = 'The command to run inside of the lock.')]
  [ValidateNotNullOrEmpty()]
  $Command,
  $MessagePrefix = ''
)

Write-Verbose "Received:`n  LockFilePath: '$LockFilePath'`n  Command: '$Command'`n  MessagePrefix: '$MessagePrefix'."

if ($MessagePrefix.Length -gt 0) {
  $MessagePrefix += ' -'
}

Write-Output "$MessagePrefix Acquiring lock"

$stream = $null

for ($i = 0; $i -lt 100 -and $null -eq $stream; $i++) {
  try {
    $stream = [System.IO.File]::Open($LockFilePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::None)
    Write-Output "$MessagePrefix Acquired lock after $i iterations"
    Invoke-Expression $Command
  }
  catch [System.IO.IOException] {
    Start-Sleep -Milliseconds 100
  }
  catch {
    Write-Output $PSItem.Exception
    exit 1
  }
  finally {
    if ($null -ne $stream -and $false -ne $stream) {
      $stream.Dispose()
      Write-Output "$MessagePrefix Released lock after $i iterations"
    }
  }
}
