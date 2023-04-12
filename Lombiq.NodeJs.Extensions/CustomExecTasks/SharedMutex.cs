using System;
using System.Diagnostics;
using System.Threading;

namespace Lombiq.NodeJs.Extensions.CustomExecTasks;

public class SharedMutex
{
    private readonly string _mutexName;
    private readonly TimeSpan _timeout;

    public int RetryIntervalMs { get; set; } = 100;

    public SharedMutex(string mutexName, TimeSpan timeout)
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
            using (var mutex = new Mutex(initiallyOwned: false, _mutexName))
            {
                if (mutex.WaitOne(0))
                {
                    // Release the mutex asap because we don't need it for execution. We only needed it to verify that
                    // it is currently not "locked", i.e. in exclusive usage.
                    mutex.ReleaseMutex();

                    logWait?.Invoke("Acquired shared access to {0} in {1}.", new object[] { _mutexName, stopwatch.Elapsed });

                    return functionToExecute();
                }
            }

            logWait?.Invoke("#{0} Waiting for shared access to {1}.", new object[] { count++, _mutexName });

            Thread.Sleep(RetryIntervalMs);
        }

        logError?.Invoke("Failed to acquire {0} in {1}.", new object[] { _mutexName, _timeout });
        return false;
    }
}
