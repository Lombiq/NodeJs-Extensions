using Microsoft.Build.Framework;
using Microsoft.Build.Tasks;
using System;
using System.Threading;

namespace Lombiq.NodeJs.Extensions.CustomExecTasks;

/// <summary>
/// An Exec task, wrapped around a critical section.
/// </summary>
/// <remarks>
/// <para>
/// We want to synchronize many shared readers and exclusive writers. Here's how to do that using a <see cref="Mutex"/>.
/// </para>
/// <list type="number">
/// <item>
/// <description>
/// Any reader process simply creates a Mutex instance without calling WaitOne() for the time of execution. This will
/// signal to the writer, that at least one reader is already relying on that Mutex. At the same, this approach still
/// allows other readers to proceed in parallel. To assure that no writer is currently using the Mutex, any reader will
/// call WaitOne(0) on it. If that call fails, it means that a writer is currently using the Mutex, and we have to wait.
/// </description>
/// </item>
/// <item>
/// <description>
/// The writer process first creates a Mutex instance and checks whether it was created just now. If yes, it will
/// process to "lock" the Mutex by calling WaitOne() on it. If not, it means that a reader is currently processing and
/// the writer needs to retry (after a short wait time).
/// </description>
/// </item>
/// </list>
/// </remarks>
public class ExecWithMutex : Exec
{
    public MutexAccess MutexAccessToUse =>
        Enum.TryParse(Access, ignoreCase: true, out MutexAccess access) ? access : MutexAccess.Undefined;

    /// <summary>
    /// Gets or sets the mutex name.
    /// </summary>
    [Required]
    public string MutexName { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="MutexAccess"/> level to use on this Mutex.
    /// </summary>
    [Required]
    public string Access { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of seconds that any thread should wait for the given mutex.
    /// </summary>
    [Required]
    public int TimeoutSeconds { get; set; }

    /// <inheritdoc />
    public override bool Execute()
    {
        var timeout = TimeSpan.FromSeconds(TimeoutSeconds);

        switch (MutexAccessToUse)
        {
            case MutexAccess.Shared:
                return new SharedMutex(MutexName, timeout).Execute(
                    () => base.Execute(),
                    (message, args) => Log.LogMessage(message, args),
                    (message, args) => Log.LogError(message, args));
            case MutexAccess.Exclusive:
                return new ExclusiveMutex(MutexName, timeout).Execute(
                    () => base.Execute(),
                    (message, args) => Log.LogMessage(message, args),
                    (message, args) => Log.LogError(message, args));
            case MutexAccess.Undefined:
            default:
                throw new ArgumentException(
                    $"{nameof(Access)} needs to be set to \"{nameof(MutexAccess.Shared)}\" or " +
                    $"\"{nameof(MutexAccess.Exclusive)}\" on the {nameof(ExecWithMutex)} task!");
        }
    }
}
