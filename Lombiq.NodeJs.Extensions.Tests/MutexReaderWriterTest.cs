using Lombiq.NodeJs.Extensions.CustomExecTasks;
using Shouldly;
using System;
using System.Globalization;
using System.Linq;
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
    private const int ReaderExecutionTimeMs = 300;
    private const int WriterExecutionTimeMs = 1000;
    private const int MaxWaitTimeMs = 5000;

    private readonly ITestOutputHelper _testOutputHelper;

    public MutexReaderWriterTest(ITestOutputHelper testOutputHelper) => _testOutputHelper = testOutputHelper;

    [Fact]
    public void SyncReadersAndWriters()
    {
        var timeout = TimeSpan.FromMilliseconds(MaxWaitTimeMs);

        var tasks = Enumerable
            .Range(1, ReaderWriterCount)
            .Select(actionIndex => RandomNumberGenerator.GetInt32(0, 2) < 1
                ? CreateReaderAction(actionIndex, timeout)
                : CreateWriterAction(actionIndex, timeout))
            .Select(Task.Run)
            .ToArray();

        Task.WaitAll(tasks);
    }

    public Action CreateReaderAction(int actionIndex, TimeSpan timeout) => () =>
    {
        _testOutputHelper.WriteLine("-> Reader {0}", actionIndex);
        // Add some random wait time to mix reader and writer threads.
        Thread.Sleep(RandomNumberGenerator.GetInt32(1000));

        new SharedMutex(MutexName, timeout)
            .Execute(
                () =>
                {
                    _testOutputHelper.WriteLine(" - Reader {0} executing", actionIndex);
                    Thread.Sleep(GetRandomTimeoutAround(ReaderExecutionTimeMs));
                    return true;
                },
                (message, mutexName) => _testOutputHelper.WriteLine(
                    " - Reader {0} waiting: {1}", actionIndex, string.Format(CultureInfo.InvariantCulture, message, mutexName)))
            .ShouldBeTrue();

        _testOutputHelper.WriteLine("<- Reader {0}", actionIndex);
    };

    public Action CreateWriterAction(int actionIndex, TimeSpan timeout) => () =>
    {
        _testOutputHelper.WriteLine("-> Writer {0}", actionIndex);
        // Add some random wait time to mix reader and writer threads.
        Thread.Sleep(RandomNumberGenerator.GetInt32(1000));

        new ExclusiveMutex(MutexName, timeout)
            .Execute(
                () =>
                {
                    _testOutputHelper.WriteLine(" + Writer {0} executing", 0);
                    Thread.Sleep(GetRandomTimeoutAround(WriterExecutionTimeMs));
                    return true;
                },
                (message, mutexName) => _testOutputHelper.WriteLine(
                    " + Writer {0} waiting: {1}", actionIndex, string.Format(CultureInfo.InvariantCulture, message, mutexName)))
            .ShouldBeTrue();

        _testOutputHelper.WriteLine("<- Writer {0}", actionIndex);
    };

    private static int GetRandomTimeoutAround(int timeoutMs) =>
        RandomNumberGenerator.GetInt32((int)(timeoutMs * 0.8), (int)(timeoutMs * 1.25));
}
