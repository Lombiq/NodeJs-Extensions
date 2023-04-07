using Lombiq.NodeJs.Extensions.CustomExecTasks;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace Lombiq.NodeJs.Extensions.Tests;

public class MutexReaderWriterTest
{
    private const string MutexName = nameof(MutexReaderWriterTest);
    private const int ReaderWriterCount = 10;
    private const int ReaderExecutionTimeMs = 1000;
    private const int WriterExecutionTimeMs = 3000;
    private const int MaxWaitTimeMs = 5000;

    private static readonly Random _random = new();

    private readonly ITestOutputHelper _testOutputHelper;

    public MutexReaderWriterTest(ITestOutputHelper testOutputHelper) => _testOutputHelper = testOutputHelper;

    [Fact]
    public void SyncWriterAndReaders()
    {
        var timeout = TimeSpan.FromMilliseconds(MaxWaitTimeMs);
        var tasks = new List<Task>();
        for (int i = 1; i <= ReaderWriterCount; i++)
        {
            var action = _random.NextDouble() < 0.5 ? Reader(i, timeout) : Writer(i, timeout);
            tasks.Add(Task.Run(action));
        }

        Task.WaitAll(tasks.ToArray());
    }

    public Action Reader(int i, TimeSpan timeout) => () =>
    {
        _testOutputHelper.WriteLine($"-> Reader {i}");
        // Add some random wait time to mix reader and writer threads.
        Thread.Sleep(_random.Next(1000));

        new SharedMutex(MutexName, timeout).Execute(
            () =>
            {
                _testOutputHelper.WriteLine($" - Reader {i} executing");
                Thread.Sleep(_random.Next((int)(ReaderExecutionTimeMs * 0.8), (int)(ReaderExecutionTimeMs * 1.25)));
                return true;
            },
            (message, mutexName) => _testOutputHelper.WriteLine($" - Reader {i} waiting: " + message, mutexName),
            (message, mutexName) => { });

        _testOutputHelper.WriteLine($"<- Reader {i}");
    };

    public Action Writer(int i, TimeSpan timeout) => () =>
    {
        _testOutputHelper.WriteLine($"-> Writer {i}");
        Thread.Sleep(_random.Next(1000));

        new ExclusiveMutex(MutexName, timeout).Execute(
            () =>
            {
                _testOutputHelper.WriteLine($" + Writer {i} executing");
                Thread.Sleep(_random.Next((int)(WriterExecutionTimeMs * 0.8), (int)(WriterExecutionTimeMs * 1.25)));
                return true;
            },
            (message, mutexName) => _testOutputHelper.WriteLine($" + Writer {i} waiting: " + message, mutexName),
            (message, mutexName) => { });

        _testOutputHelper.WriteLine($"<- Writer {i}");
    };
}
