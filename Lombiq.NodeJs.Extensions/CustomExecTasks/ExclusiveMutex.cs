using System;
using System.Diagnostics;
using System.Threading;

namespace Lombiq.NodeJs.Extensions.CustomExecTasks;

public class ExclusiveMutex
{
    private readonly string _mutexName;
    private readonly TimeSpan _timeout;

    public int RetryIntervalMs { get; set; } = 100;
    public int WaitTimeMs { get; set; } = 1000;

    public ExclusiveMutex(string mutexName, TimeSpan timeout)
    {
        _mutexName = mutexName;
        _timeout = timeout;
    }

    public bool Execute(
        Func<bool> functionToExecute, Action<string, object[]> logWait = null, Action<string, object[]> logError = null)
    {
        var count = 1;
        var stopwatch = Stopwatch.StartNew();
        while (stopwatch.Elapsed <= _timeout)
        {
            using (var mutex = new Mutex(initiallyOwned: false, _mutexName, out var createdNew))
            {
                // We only try to acquire the mutex in case it was freshly created, because that means that no other
                // processes are currently using it, including in a shared way.
                if (createdNew && mutex.WaitOne(WaitTimeMs))
                {
                    try
                    {
                        logWait?.Invoke(
                            "Acquired exclusive access to {0} after {1}.", [_mutexName, stopwatch.Elapsed]);
                        return functionToExecute();
                    }
                    finally
                    {
                        mutex.ReleaseMutex();
                    }
                }
            }

            logWait?.Invoke("#{0} Waiting for exclusive access to {1}.", [count++, _mutexName]);
            Thread.Sleep(RetryIntervalMs);
        }

        logError?.Invoke("Failed to acquire exclusive access {0} in {1}.", [_mutexName, _timeout]);
        return false;
    }
}
