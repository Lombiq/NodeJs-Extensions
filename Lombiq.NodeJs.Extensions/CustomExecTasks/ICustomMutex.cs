using System;

namespace Lombiq.NodeJs.Extensions.CustomExecTasks;

public interface ICustomMutex
{
    bool Execute(Func<bool> functionToExecute, Action<string, object[]> logWait, Action<string, object[]> logError);
}
