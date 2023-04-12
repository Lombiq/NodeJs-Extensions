using Lombiq.NodeJs.Extensions.CustomExecTasks;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Security.Cryptography;
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

    private readonly ITestOutputHelper _testOutputHelper;

    public MutexReaderWriterTest(ITestOutputHelper testOutputHelper) => _testOutputHelper = testOutputHelper;

    [Fact]
    public void SyncWriterAndReaders()
    {
        var timeout = TimeSpan.FromMilliseconds(MaxWaitTimeMs);
        var tasks = new List<Task>();

        for (var actionIndex = 1; actionIndex <= ReaderWriterCount; actionIndex++)
        {
            var action = RandomNumberGenerator.GetInt32(0, 2) < 1
                ? CreateReaderAction(actionIndex, timeout)
                : CreateWriterAction(actionIndex, timeout);
            tasks.Add(Task.Run(action));
        }

        Task.WaitAll(tasks.ToArray());
    }

    [SuppressMessage(
        "Design",
        "MA0076:Do not use implicit culture-sensitive ToString in interpolated strings",
        Justification = "This is just test code.")]
    public Action Reader(int i, TimeSpan timeout) => () =>
    {
        _testOutputHelper.WriteLine($"-> Reader {i}");
        // Add some random wait time to mix reader and writer threads.
        Thread.Sleep(RandomNumberGenerator.GetInt32(1000));

        new SharedMutex(MutexName, timeout).Execute(
            () =>
            {
                _testOutputHelper.WriteLine($" - Reader {i} executing");
                Thread.Sleep(RandomNumberGenerator.GetInt32((int)(ReaderExecutionTimeMs * 0.8), (int)(ReaderExecutionTimeMs * 1.25)));
                return true;
            },
            (message, mutexName) => _testOutputHelper.WriteLine($" - Reader {i} waiting: " + message, mutexName),
            (_, _) => { });

        _testOutputHelper.WriteLine($"<- Reader {i}");
    };

    [SuppressMessage(
        "Design",
        "MA0076:Do not use implicit culture-sensitive ToString in interpolated strings",
        Justification = "This is just test code.")]
    public Action Writer(int i, TimeSpan timeout) => () =>
    {
        _testOutputHelper.WriteLine($"-> Writer {i}");
        Thread.Sleep(RandomNumberGenerator.GetInt32(1000));

        new ExclusiveMutex(MutexName, timeout).Execute(
            () =>
            {
                _testOutputHelper.WriteLine($" + Writer {i} executing");
                Thread.Sleep(RandomNumberGenerator.GetInt32((int)(WriterExecutionTimeMs * 0.8), (int)(WriterExecutionTimeMs * 1.25)));
                return true;
            },
            (message, mutexName) => _testOutputHelper.WriteLine($" + Writer {i} waiting: " + message, mutexName),
            (_, _) => { });

        _testOutputHelper.WriteLine($"<- Writer {i}");
    };
}
