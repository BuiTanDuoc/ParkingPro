using Microsoft.AspNetCore.SignalR;
using ParkingPro.Application.Interfaces;

namespace ParkingPro.Infrastructure.Hubs;

public class ParkingNotifier : IParkingNotifier
{
    private readonly IHubContext<ParkingHub> _hubContext;

    public ParkingNotifier(IHubContext<ParkingHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task NotifySlotStatusChangedAsync(Guid parkingLotId, Guid slotId, string newStatus, CancellationToken ct = default) =>
        _hubContext.Clients.Group(ParkingHub.GroupName(parkingLotId.ToString()))
            .SendAsync("SlotStatusChanged", new { slotId, newStatus }, ct);

    public Task NotifySessionCheckedInAsync(Guid parkingLotId, Guid sessionId, CancellationToken ct = default) =>
        _hubContext.Clients.Group(ParkingHub.GroupName(parkingLotId.ToString()))
            .SendAsync("SessionCheckedIn", new { sessionId }, ct);

    public Task NotifySessionCheckedOutAsync(Guid parkingLotId, Guid sessionId, CancellationToken ct = default) =>
        _hubContext.Clients.Group(ParkingHub.GroupName(parkingLotId.ToString()))
            .SendAsync("SessionCheckedOut", new { sessionId }, ct);
}
