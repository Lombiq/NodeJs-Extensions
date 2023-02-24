[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingInvokeExpression', '', Justification = 'Keep it DRY.')]

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

Write-Output "$MessagePrefix Acquiring lock"

$maxTries = 100
$sleepMs = 100
$stream = $null

for ($i = 0; $i -lt $maxTries -and $null -eq $stream; $i++)
{
    try
    {
        $stream = [System.IO.File]::Open($LockFilePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::None)
        Write-Output "$MessagePrefix Acquired lock after $i iterations"
        Invoke-Expression $Command
    }
    catch [System.IO.IOException]
    {
        # These are expected to happen, keep going.
        Start-Sleep -Milliseconds $sleepMs
    }
    catch
    {
        # When an unexpected exception is thrown, fail the script.
        Write-Output $PSItem.Exception
        exit 1
    }
    finally
    {
        if ($null -ne $stream)
        {
            $stream.Dispose()
            Write-Output "$MessagePrefix Released lock"
        }
    }
}

if ($null -eq $stream)
{
    Write-Error "$MessagePrefix Did not acquire the necessary lock to run '$Command' within $($maxTries * $sleepMs)ms. Please try again."
}
