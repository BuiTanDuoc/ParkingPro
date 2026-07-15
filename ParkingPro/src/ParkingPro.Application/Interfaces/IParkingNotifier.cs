namespace ParkingPro.Application.Interfaces;

/// <summary>
/// Trừu tượng hóa việc phát sự kiện realtime (SignalR nằm ở Infrastructure,
/// Application không phụ thuộc trực tiếp vào SignalR).
/// </summary>
public interface IParkingNotifier
{
    Task NotifySlotStatusChangedAsync(Guid parkingLotId, Guid slotId, string newStatus, CancellationToken ct = default);
    Task NotifySessionCheckedInAsync(Guid parkingLotId, Guid sessionId, CancellationToken ct = default);
    Task NotifySessionCheckedOutAsync(Guid parkingLotId, Guid sessionId, CancellationToken ct = default);
}
