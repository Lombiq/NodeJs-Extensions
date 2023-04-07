using System;
using System.Diagnostics;
using System.Threading;

namespace Lombiq.NodeJs.Extensions.CustomExecTasks;

public class ExclusiveMutex
    : ICustomMutex
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

    public bool Execute(Func<bool> functionToExecute, Action<string, object[]> logWait, Action<string, object[]> logError)
    {
        var stopwatch = Stopwatch.StartNew();
        bool createdNew = false;
        while (!createdNew)
        {
            using (var mutex = new Mutex(initiallyOwned: false, _mutexName, out createdNew))
            {
                try
                {
                    if (createdNew && mutex.WaitOne(WaitTimeMs))
                    {
                        return functionToExecute();
                    }
                }
                finally
                {
                    mutex.ReleaseMutex();
                }
            }

            if (stopwatch.Elapsed > _timeout)
            {
                logError?.Invoke("Failed to acquire {0} in {1}.", new object[] { _mutexName, _timeout });
                return false;
            }

            if (!createdNew)
            {
                logWait?.Invoke("Waiting for exclusive access to {0}", new object[] { _mutexName });
                Thread.Sleep(RetryIntervalMs);
            }
        }

        return false;
    }
}
