using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ParkingPro.Infrastructure.Hubs;

/// <summary>
/// Hub SignalR — client (Admin Web) subscribe theo group "lot-{parkingLotId}"
/// để chỉ nhận sự kiện của bãi xe đang xem.
/// </summary>
[Authorize]
public class ParkingHub : Hub
{
    public async Task JoinLotGroup(string parkingLotId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(parkingLotId));
    }

    public async Task LeaveLotGroup(string parkingLotId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(parkingLotId));
    }

    public static string GroupName(string parkingLotId) => $"lot-{parkingLotId}";
}
