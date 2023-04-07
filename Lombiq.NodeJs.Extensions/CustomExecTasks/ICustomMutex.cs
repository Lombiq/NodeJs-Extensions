using System;
using System.Threading;

namespace Lombiq.NodeJs.Extensions.CustomExecTasks;

/// <summary>
/// An abstraction over <see cref="Mutex"/> to access it in different ways.
/// </summary>
public interface ICustomMutex
{
    /// <summary>
    /// Execute the given function while synchronizing access to an underlying mutex.
    /// </summary>
    /// <param name="functionToExecute">The function to execute once access to the mutex has been granted.</param>
    /// <param name="logWait">A logging action to execute before waiting for access to the mutex.</param>
    /// <param name="logError">A logging action to execute in case a given timeout was exceeded.</param>
    /// <returns>
    /// The return value of the <paramref name="functionToExecute"/>, or <see langword="false"/> in case of a timeout.
    /// </returns>
    bool Execute(Func<bool> functionToExecute, Action<string, object[]> logWait, Action<string, object[]> logError);
}
