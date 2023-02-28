[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingInvokeExpression', '', Justification = 'No user input used. Allows us to reuse this script.')]

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

Write-Output "$MessagePrefix Acquiring lock..."

$timeoutMs = 20000
$sleepMs = 100
$maxTries = $timeoutMs / $sleepMs
$stream = $null

# Try to get an exclusive lock on a lock file to guarantee only one thread will execute the given $Command at any given time.
for ($currentTry = 0; $currentTry -lt $maxTries -and $null -eq $stream; $currentTry++)
{
    try
    {
        $stream = [System.IO.File]::Open($LockFilePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::None)
        Write-Output "$MessagePrefix Acquired lock after $currentTry iterations."
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
            Write-Output "$MessagePrefix Released lock."
        }
    }
}

if ($null -eq $stream)
{
    Write-Error "$MessagePrefix Did not acquire the necessary lock to run '$Command' within $($maxTries * $sleepMs)ms. Please try again."
    exit 1
}
