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
$errorCount = 0
$maxErrors = 5
$done = $false

# Try to get an exclusive lock on a file to guarantee only one thread will execute the given $Command at any given time.
for ($currentTry = 0; -not $done -and $currentTry -lt $maxTries -and $errorCount -lt $maxErrors; $currentTry++)
{
    try
    {
        $stream = [System.IO.File]::Open(
            $LockFilePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::None)
        Write-Output "$MessagePrefix Acquired lock after $currentTry iterations."
        # Adding "fail" here will throw an exception in case $Command itself fails, even without an exception. This is
        # to jump into the catch block and count errors before failing the script.
        Invoke-Expression "$Command || fail"
        # We only end up here if the above line did not throw any exception, which means it ran successfully.
        $done = $true
    }
    catch
    {
        # IOExceptions are expected to happen due to concurrent access to the lock file; ignore those.
        if ($PSItem.Exception.GetType().Name -ne 'IOException')
        {
            $errorCount++
            $currentTry = -1
            # Only print the error if it's not because of calling "fail".
            if ($PSItem.Exception.CommandName -ne 'fail')
            {
                Write-Output $PSItem.Exception
            }
        }
    }
    finally
    {
        if ($null -ne $stream)
        {
            $stream.Dispose()
            $stream = $null
            Write-Output "$MessagePrefix Released lock."
        }

        Start-Sleep -Milliseconds $sleepMs
    }
}

# When an unexpected exception is thrown for too many times, fail the script.
if ($errorCount -ge $maxErrors)
{
    throw "$MessagePrefix Failed to run '$Command' successfully within $errorCount tries. Please try again."
}

if (-not $done)
{
    throw "$MessagePrefix Failed to run '$Command' within $($maxTries * $sleepMs)ms. Please try again."
}
