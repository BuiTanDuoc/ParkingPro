using ParkingPro.Application.Common;
using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.Sessions;
using ParkingPro.Application.Interfaces;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;
using ParkingPro.Shared.Constants;

namespace ParkingPro.Application.Services;

/// <summary>
/// Toàn bộ nghiệp vụ check-in / check-out xe vãng lai (theo giờ/theo ngày).
/// Controller chỉ gọi thẳng các method này, không qua Command/Query hay Mediator.
/// </summary>
public class ParkingSessionService : IParkingSessionService
{
    private readonly IUnitOfWork _uow;
    private readonly IPricingService _pricingService;
    private readonly IParkingNotifier _notifier;
    private readonly IFileStorageService _fileStorage;

    public ParkingSessionService(
        IUnitOfWork uow, IPricingService pricingService, IParkingNotifier notifier, IFileStorageService fileStorage)
    {
        _uow = uow;
        _pricingService = pricingService;
        _notifier = notifier;
        _fileStorage = fileStorage;
    }

    public async Task<CheckInResponse> CheckInAsync(
        CheckInRequest request, Guid staffUserId,
        Stream? photoStream, string? photoFileName, CancellationToken ct = default)
    {
        if (request.SessionType == SessionType.TheoThang)
            throw new BadRequestException("Xe vé tháng phải check-in qua hợp đồng vé tháng, không dùng API này.");

        // 1. Tìm hoặc tạo Vehicle theo biển số
        var vehicle = await _uow.Vehicles.FirstOrDefaultAsync(v => v.LicensePlate == request.LicensePlate, ct);
        if (vehicle is null)
        {
            vehicle = new Vehicle
            {
                LicensePlate = request.LicensePlate,
                Type = request.VehicleType
            };
            await _uow.Vehicles.AddAsync(vehicle, ct);
        }

        // 2. Không cho check-in nếu xe đang có 1 phiên gửi chưa checkout
        var existingActiveSession = await _uow.ParkingSessions.FirstOrDefaultAsync(
            s => s.VehicleId == vehicle.Id && s.Status == SessionStatus.DangGuiXe, ct);
        if (existingActiveSession is not null)
            throw new ConflictException($"Xe {request.LicensePlate} đang có phiên gửi xe chưa checkout.");

        // 3. Chọn slot: ưu tiên slot được yêu cầu, nếu không thì lấy slot trống đầu tiên
        ParkingSlot? slot;
        if (request.PreferredSlotId is not null)
        {
            slot = await _uow.ParkingSlots.GetByIdAsync(request.PreferredSlotId.Value, ct)
                ?? throw new NotFoundException(nameof(ParkingSlot), request.PreferredSlotId.Value);

            if (slot.Status != SlotStatus.Trong)
                throw new ConflictException($"Slot {slot.Code} hiện không trống.");
        }
        else
        {
            slot = await _uow.ParkingSlots.FirstOrDefaultAsync(
                s => s.Zone.ParkingLotId == request.ParkingLotId
                     && s.Status == SlotStatus.Trong
                     && s.Type != SlotType.DanhChoVeThang,
                ct);

            if (slot is null)
                throw new ConflictException("Bãi xe đã hết chỗ trống.");
        }

        // 4. Ảnh check-in: upload nếu nhân viên có chụp, không thì dùng ảnh mặc định (không bắt buộc)
        string checkInImageUrl;
        if (photoStream is not null && !string.IsNullOrWhiteSpace(photoFileName))
            checkInImageUrl = await _fileStorage.SaveAsync(photoStream, photoFileName, "sessions/checkin", ct);
        else
            checkInImageUrl = AppConstants.DefaultPhotos.DefaultCheckInPhotoUrl;

        // 5. Tạo phiên gửi xe + cập nhật trạng thái slot
        var session = new ParkingSession
        {
            ParkingLotId = request.ParkingLotId,
            VehicleId = vehicle.Id,
            Vehicle = vehicle,
            SlotId = slot.Id,
            Slot = slot,
            SessionType = request.SessionType,
            Status = SessionStatus.DangGuiXe,
            CheckInAtUtc = DateTime.UtcNow,
            CheckInImageUrl = checkInImageUrl,
            CheckInStaffId = staffUserId
        };

        slot.Status = SlotStatus.DangDauXe;

        await _uow.ExecuteInTransactionAsync(async () =>
        {
            await _uow.ParkingSessions.AddAsync(session, ct);
            _uow.ParkingSlots.Update(slot);
            await _uow.SaveChangesAsync(ct);
        }, ct);

        await _notifier.NotifySlotStatusChangedAsync(request.ParkingLotId, slot.Id, slot.Status.ToString(), ct);
        await _notifier.NotifySessionCheckedInAsync(request.ParkingLotId, session.Id, ct);

        return new CheckInResponse(
            session.Id, vehicle.LicensePlate, slot.Code, session.CheckInAtUtc, session.SessionType.ToString(), checkInImageUrl);
    }

    public async Task<CheckOutResponse> CheckOutAsync(
        Guid sessionId, Guid staffUserId,
        Stream? photoStream, string? photoFileName, CancellationToken ct = default)
    {
        var session = await _uow.ParkingSessions.GetByIdAsync(sessionId, ct)
            ?? throw new NotFoundException(nameof(ParkingSession), sessionId);

        if (session.Status != SessionStatus.DangGuiXe)
            throw new ConflictException("Phiên gửi xe này đã được checkout hoặc đã hủy.");

        var slot = await _uow.ParkingSlots.GetByIdAsync(session.SlotId, ct)
            ?? throw new NotFoundException(nameof(ParkingSlot), session.SlotId);

        var vehicle = await _uow.Vehicles.GetByIdAsync(session.VehicleId, ct)
            ?? throw new NotFoundException(nameof(Vehicle), session.VehicleId);

        session.CheckOutAtUtc = DateTime.UtcNow;
        session.TotalAmount = await _pricingService.CalculateSessionFeeAsync(session, ct);
        session.Status = SessionStatus.DaThanhToan;
        session.CheckOutStaffId = staffUserId;

        // Ảnh check-out: upload nếu nhân viên có chụp, không thì dùng ảnh mặc định (không bắt buộc)
        session.CheckOutImageUrl = photoStream is not null && !string.IsNullOrWhiteSpace(photoFileName)
            ? await _fileStorage.SaveAsync(photoStream, photoFileName, "sessions/checkout", ct)
            : AppConstants.DefaultPhotos.DefaultCheckOutPhotoUrl;

        slot.Status = SlotStatus.Trong;

        var payment = new Payment
        {
            ParkingSessionId = session.Id,
            Amount = session.TotalAmount.Value,
            Method = Domain.Enums.PaymentMethod.TienMat,
            Status = Domain.Enums.PaymentStatus.DaThanhToan,
            ReceivedByStaffId = staffUserId,
            PaidAtUtc = DateTime.UtcNow
        };

        await _uow.ExecuteInTransactionAsync(async () =>
        {
            _uow.ParkingSessions.Update(session);
            _uow.ParkingSlots.Update(slot);
            await _uow.Payments.AddAsync(payment, ct);
            await _uow.SaveChangesAsync(ct);
        }, ct);

        await _notifier.NotifySlotStatusChangedAsync(session.ParkingLotId, slot.Id, slot.Status.ToString(), ct);
        await _notifier.NotifySessionCheckedOutAsync(session.ParkingLotId, session.Id, ct);

        return new CheckOutResponse(
            session.Id, vehicle.LicensePlate, session.CheckInAtUtc,
            session.CheckOutAtUtc.Value, session.TotalAmount.Value, slot.Code, session.CheckOutImageUrl!);
    }

    public async Task<ParkingSessionDto> GetByIdAsync(Guid sessionId, CancellationToken ct = default)
    {
        var session = await _uow.ParkingSessions.GetByIdAsync(sessionId, ct)
            ?? throw new NotFoundException(nameof(ParkingSession), sessionId);

        var vehicle = await _uow.Vehicles.GetByIdAsync(session.VehicleId, ct);
        var slot = await _uow.ParkingSlots.GetByIdAsync(session.SlotId, ct);

        return MapToDto(session, vehicle, slot);
    }

    public async Task<PagedResult<ParkingSessionDto>> GetActiveSessionsAsync(Guid parkingLotId, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var query = _uow.ParkingSessions.Query()
            .Where(s => s.ParkingLotId == parkingLotId && s.Status == SessionStatus.DangGuiXe)
            .OrderByDescending(s => s.CheckInAtUtc);

        var totalCount = query.Count();
        var pageItems = query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var items = new List<ParkingSessionDto>();
        foreach (var s in pageItems)
        {
            var vehicle = await _uow.Vehicles.GetByIdAsync(s.VehicleId, ct);
            var slot = await _uow.ParkingSlots.GetByIdAsync(s.SlotId, ct);
            items.Add(MapToDto(s, vehicle, slot));
        }

        return new PagedResult<ParkingSessionDto>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    private static ParkingSessionDto MapToDto(ParkingSession session, Vehicle? vehicle, ParkingSlot? slot) =>
        new(
            session.Id,
            vehicle?.LicensePlate ?? "N/A",
            slot?.Code ?? "N/A",
            session.SessionType.ToString(),
            session.Status.ToString(),
            session.CheckInAtUtc,
            session.CheckOutAtUtc,
            session.TotalAmount,
            session.CheckInImageUrl,
            session.CheckOutImageUrl);
}
