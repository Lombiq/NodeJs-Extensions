using Microsoft.Build.Framework;
using Microsoft.Build.Tasks;
using System;
using System.Diagnostics;
using System.Threading;

namespace Lombiq.NodeJs.Extensions;

/// <summary>
/// Like an Exec task, but with critical section.
/// </summary>
public class ExecWithMutex : Exec
{
    /// <summary>
    /// Gets or sets mutex name.
    /// </summary>
    [Required]
    public string MutexName { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of seconds that any thread should wait for the given mutex.
    /// </summary>
    [Required]
    public int TimeoutSeconds { get; set; }

    /// <inheritdoc />
    public override bool Execute()
    {
        var timeout = TimeSpan.FromSeconds(TimeoutSeconds);

        Log.LogMessage(MessageImportance.Normal, "Waiting for {0}", MutexName);

        using var mutex = new Mutex(initiallyOwned: false, MutexName);
        try
        {
            var stopwatch = Stopwatch.StartNew();

            // Suppressing a false positive. We're releasing the lock in the _finally_ branch.
#pragma warning disable S2222 // Locks should be released on all paths
            if (mutex.WaitOne(timeout))
#pragma warning restore S2222 // Locks should be released on all paths
            {
                Log.LogMessage(MessageImportance.Normal, "Acquired {0} after {1}", MutexName, stopwatch.Elapsed);

                return base.Execute();
            }

            Log.LogError("{0} could not be acquired.", MutexName);
        }
        finally
        {
            Log.LogMessage(MessageImportance.Normal, "Releasing {0}", MutexName);
            mutex.ReleaseMutex();
        }

        Log.LogError("Failed to acquire {0} in {1}.", MutexName, timeout);
        return false;
    }
}
