using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace Lombiq.NodeJs.Extensions.Tests;

public class MutexReaderWriterTest
{
    private static readonly Random _random = new Random();

    private readonly ITestOutputHelper _testOutputHelper;

    public MutexReaderWriterTest(ITestOutputHelper testOutputHelper) => _testOutputHelper = testOutputHelper;

    [Fact]
    public void SyncWriterAndReaders()
    {
        var tasks = new List<Task>();
        for (int i = 1; i <= 10; i++)
        {
            tasks.Add(Task.Run(Reader(i)));
        }

        tasks.Add(Task.Run(Writer(1)));
        Task.WaitAll(tasks.ToArray());
    }

    public Action Reader(int i) => () =>
    {
        Thread.Sleep(_random.Next(1000));
        _testOutputHelper.WriteLine($"Reader {i} finished");
    };

    public Action Writer(int i) => () =>
    {
        Thread.Sleep(_random.Next(1000));
        _testOutputHelper.WriteLine($"Writer {i} finished");
    };
}
