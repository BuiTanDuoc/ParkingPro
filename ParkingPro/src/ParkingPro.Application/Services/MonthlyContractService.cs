using ParkingPro.Application.Common;
using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.MonthlyContracts;
using ParkingPro.Application.Interfaces;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;
using ParkingPro.Shared.Constants;

namespace ParkingPro.Application.Services;

public class MonthlyContractService : IMonthlyContractService
{
    private readonly IUnitOfWork _uow;
    private readonly IPricingService _pricingService;
    private readonly IFileStorageService _fileStorage;
    private readonly IPasswordHasher _passwordHasher;

    public MonthlyContractService(
        IUnitOfWork uow, IPricingService pricingService, IFileStorageService fileStorage, IPasswordHasher passwordHasher)
    {
        _uow = uow;
        _pricingService = pricingService;
        _fileStorage = fileStorage;
        _passwordHasher = passwordHasher;
    }

    public async Task<MonthlyContractDto> CreateAsync(
        CreateMonthlyContractRequest request, Guid staffUserId,
        Stream? vehiclePhotoStream, string? vehiclePhotoFileName, CancellationToken ct = default)
    {
        if (request.NumberOfMonths <= 0)
            throw new BadRequestException("Số tháng đăng ký phải lớn hơn 0.");

        var customer = await ResolveCustomerAsync(
            request.CustomerUserId,
            request.NewCustomerFullName, request.NewCustomerEmail, request.NewCustomerPassword, request.NewCustomerPhoneNumber,
            ct);

        var vehicle = await _uow.Vehicles.FirstOrDefaultAsync(v => v.LicensePlate == request.LicensePlate, ct);
        var isNewVehicle = vehicle is null;
        if (vehicle is null)
        {
            vehicle = new Vehicle
            {
                LicensePlate = request.LicensePlate,
                Type = VehicleType.OToDuoi7Cho,
                OwnerUserId = customer.Id
            };
            await _uow.Vehicles.AddAsync(vehicle, ct);
        }

        // Ảnh xe: ưu tiên ảnh vừa upload (nếu có); nếu xe chưa từng có ảnh thì dùng ảnh mặc định.
        // Không upload lại nếu xe cũ đã có ảnh từ trước và lần này không gửi ảnh mới.
        if (vehiclePhotoStream is not null && !string.IsNullOrWhiteSpace(vehiclePhotoFileName))
        {
            vehicle.PhotoUrl = await _fileStorage.SaveAsync(vehiclePhotoStream, vehiclePhotoFileName, "vehicles", ct);
            if (!isNewVehicle) _uow.Vehicles.Update(vehicle);
        }
        else if (string.IsNullOrEmpty(vehicle.PhotoUrl))
        {
            vehicle.PhotoUrl = AppConstants.DefaultPhotos.DefaultVehiclePhotoUrl;
            if (!isNewVehicle) _uow.Vehicles.Update(vehicle);
        }

        ParkingSlot? fixedSlot = null;
        if (request.FixedSlotId is not null)
        {
            fixedSlot = await _uow.ParkingSlots.GetByIdAsync(request.FixedSlotId.Value, ct)
                ?? throw new NotFoundException(nameof(ParkingSlot), request.FixedSlotId.Value);

            if (fixedSlot.Status != SlotStatus.Trong)
                throw new ConflictException($"Slot {fixedSlot.Code} hiện không thể gán cố định (không trống).");
        }

        var monthlyFee = await _pricingService.GetMonthlyFeeAsync(request.ParkingLotId, vehicle.Type, ct);
        var endDate = request.StartDate.AddMonths(request.NumberOfMonths);

        var contract = new MonthlyContract
        {
            ParkingLotId = request.ParkingLotId,
            VehicleId = vehicle.Id,
            Vehicle = vehicle,
            CustomerUserId = customer.Id,
            CustomerUser = customer,
            FixedSlotId = fixedSlot?.Id,
            FixedSlot = fixedSlot,
            StartDate = request.StartDate,
            EndDate = endDate,
            MonthlyFee = monthlyFee,
            Status = ContractStatus.DangHoatDong,
            AutoRenew = request.AutoRenew
        };

        // Thu tiền trọn gói ngay lúc đăng ký, theo số tháng đã chọn
        var payment = new Payment
        {
            MonthlyContract = contract,
            Amount = monthlyFee * request.NumberOfMonths,
            Method = PaymentMethod.TienMat,
            Status = PaymentStatus.DaThanhToan,
            ReceivedByStaffId = staffUserId,
            PaidAtUtc = DateTime.UtcNow
        };

        await _uow.ExecuteInTransactionAsync(async () =>
        {
            await _uow.MonthlyContracts.AddAsync(contract, ct);
            await _uow.Payments.AddAsync(payment, ct);

            if (fixedSlot is not null)
            {
                fixedSlot.Status = SlotStatus.DaDatTruoc;
                fixedSlot.Type = SlotType.DanhChoVeThang;
                _uow.ParkingSlots.Update(fixedSlot);
            }

            await _uow.SaveChangesAsync(ct);
        }, ct);

        // contract vừa tạo đã có sẵn Vehicle/CustomerUser/FixedSlot gán thủ công ở trên nên map trực tiếp được, không cần fetch lại
        return await MapToDtoAsync(contract, ct);
    }

    public async Task<MonthlyContractDto> RenewAsync(Guid contractId, int additionalMonths, Guid staffUserId, CancellationToken ct = default)
    {
        if (additionalMonths <= 0)
            throw new BadRequestException("Số tháng gia hạn phải lớn hơn 0.");

        var contract = await _uow.MonthlyContracts.GetByIdAsync(contractId, ct)
            ?? throw new NotFoundException(nameof(MonthlyContract), contractId);

        if (contract.Status == ContractStatus.DaHuy)
            throw new ConflictException("Không thể gia hạn hợp đồng đã bị hủy.");

        var baseDate = contract.EndDate < DateOnly.FromDateTime(DateTime.UtcNow)
            ? DateOnly.FromDateTime(DateTime.UtcNow)
            : contract.EndDate;

        contract.EndDate = baseDate.AddMonths(additionalMonths);
        contract.Status = ContractStatus.DangHoatDong;

        var payment = new Payment
        {
            MonthlyContractId = contract.Id,
            Amount = contract.MonthlyFee * additionalMonths,
            Method = PaymentMethod.TienMat,
            Status = PaymentStatus.DaThanhToan,
            ReceivedByStaffId = staffUserId,
            PaidAtUtc = DateTime.UtcNow
        };

        await _uow.ExecuteInTransactionAsync(async () =>
        {
            _uow.MonthlyContracts.Update(contract);
            await _uow.Payments.AddAsync(payment, ct);
            await _uow.SaveChangesAsync(ct);
        }, ct);

        return await MapToDtoAsync(contract, ct);
    }

    public async Task<MonthlyContractDto> UpdateAsync(Guid contractId, UpdateMonthlyContractRequest request, CancellationToken ct = default)
    {
        var contract = await _uow.MonthlyContracts.GetByIdAsync(contractId, ct)
            ?? throw new NotFoundException(nameof(MonthlyContract), contractId);

        if (contract.Status == ContractStatus.DaHuy)
            throw new ConflictException("Không thể sửa hợp đồng đã bị hủy.");

        if (string.IsNullOrWhiteSpace(request.LicensePlate))
            throw new BadRequestException("Biển số xe không được để trống.");

        var vehicle = await _uow.Vehicles.GetByIdAsync(contract.VehicleId, ct);
        if (vehicle is not null &&
            !string.Equals(vehicle.LicensePlate, request.LicensePlate, StringComparison.OrdinalIgnoreCase))
        {
            vehicle.LicensePlate = request.LicensePlate;
            _uow.Vehicles.Update(vehicle);
        }

        contract.AutoRenew = request.AutoRenew;

        // Đổi khách hàng: chỉ xử lý nếu người dùng thật sự chọn khách khác hoặc nhập thông tin tạo mới
        var wantsCustomerChange = request.CustomerUserId is not null
            || !string.IsNullOrWhiteSpace(request.NewCustomerEmail);
        if (wantsCustomerChange)
        {
            var newCustomer = await ResolveCustomerAsync(
                request.CustomerUserId,
                request.NewCustomerFullName, request.NewCustomerEmail, request.NewCustomerPassword, request.NewCustomerPhoneNumber,
                ct);

            if (newCustomer.Id != contract.CustomerUserId)
            {
                contract.CustomerUserId = newCustomer.Id;
                contract.CustomerUser = newCustomer;
            }
        }

        // Đổi slot cố định: cho phép gán mới, đổi sang slot khác, hoặc bỏ gán (FixedSlotId = null)
        if (request.FixedSlotId != contract.FixedSlotId)
        {
            if (contract.FixedSlotId is not null)
            {
                var oldSlot = await _uow.ParkingSlots.GetByIdAsync(contract.FixedSlotId.Value, ct);
                if (oldSlot is not null)
                {
                    oldSlot.Status = SlotStatus.Trong;
                    oldSlot.Type = SlotType.Thuong;
                    _uow.ParkingSlots.Update(oldSlot);
                }
            }

            if (request.FixedSlotId is not null)
            {
                var newSlot = await _uow.ParkingSlots.GetByIdAsync(request.FixedSlotId.Value, ct)
                    ?? throw new NotFoundException(nameof(ParkingSlot), request.FixedSlotId.Value);

                if (newSlot.Status != SlotStatus.Trong)
                    throw new ConflictException($"Slot {newSlot.Code} hiện không thể gán cố định (không trống).");

                newSlot.Status = SlotStatus.DaDatTruoc;
                newSlot.Type = SlotType.DanhChoVeThang;
                _uow.ParkingSlots.Update(newSlot);
            }

            contract.FixedSlotId = request.FixedSlotId;
            contract.FixedSlot = null;
        }

        _uow.MonthlyContracts.Update(contract);

        await _uow.ExecuteInTransactionAsync(async () =>
        {
            await _uow.SaveChangesAsync(ct);
        }, ct);

        return await MapToDtoAsync(contract, ct);
    }

    public async Task CancelAsync(Guid contractId, CancellationToken ct = default)
    {
        var contract = await _uow.MonthlyContracts.GetByIdAsync(contractId, ct)
            ?? throw new NotFoundException(nameof(MonthlyContract), contractId);

        contract.Status = ContractStatus.DaHuy;
        _uow.MonthlyContracts.Update(contract);

        if (contract.FixedSlotId is not null)
        {
            var slot = await _uow.ParkingSlots.GetByIdAsync(contract.FixedSlotId.Value, ct);
            if (slot is not null)
            {
                slot.Status = SlotStatus.Trong;
                slot.Type = SlotType.Thuong;
                _uow.ParkingSlots.Update(slot);
            }
        }

        await _uow.SaveChangesAsync(ct);
    }

    public async Task<PagedResult<MonthlyContractDto>> GetExpiringSoonAsync(Guid parkingLotId, int withinDays, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var thresholdDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(withinDays);

        var query = _uow.MonthlyContracts.Query()
            .Where(c => c.ParkingLotId == parkingLotId
                        && c.Status == ContractStatus.DangHoatDong
                        && c.EndDate <= thresholdDate)
            .OrderBy(c => c.EndDate);

        var totalCount = query.Count();
        var pageItems = query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var items = new List<MonthlyContractDto>();
        foreach (var contract in pageItems)
            items.Add(await MapToDtoAsync(contract, ct));

        return new PagedResult<MonthlyContractDto>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PagedResult<MonthlyContractDto>> GetAllAsync(
        Guid parkingLotId, string? status, string? search, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var query = _uow.MonthlyContracts.Query().Where(c => c.ParkingLotId == parkingLotId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ContractStatus>(status, true, out var statusEnum))
            query = query.Where(c => c.Status == statusEnum);

        var contracts = query.OrderBy(c => c.EndDate).ToList();

        var items = new List<MonthlyContractDto>();
        foreach (var contract in contracts)
            items.Add(await MapToDtoAsync(contract, ct));

        // Tìm theo biển số/tên khách hàng thực hiện ở tầng ứng dụng vì 2 field này
        // nằm ở Vehicle/User, không có trên MonthlyContract để lọc trực tiếp bằng SQL.
        if (!string.IsNullOrWhiteSpace(search))
        {
            var keyword = search.Trim().ToLower();
            items = items
                .Where(i => i.LicensePlate.ToLower().Contains(keyword) || i.CustomerName.ToLower().Contains(keyword))
                .ToList();
        }

        var totalCount = items.Count;
        var pageItems = items.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        return new PagedResult<MonthlyContractDto>
        {
            Items = pageItems,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<MonthlyContractDto> GetActiveContractBySlotAsync(Guid slotId, CancellationToken ct = default)
    {
        var contract = await _uow.MonthlyContracts.FirstOrDefaultAsync(
            c => c.FixedSlotId == slotId && c.Status != ContractStatus.DaHuy, ct)
            ?? throw new NotFoundException("Hợp đồng vé tháng cho slot", slotId);

        return await MapToDtoAsync(contract, ct);
    }

    /// <summary>
    /// Chọn khách hàng cho hợp đồng: dùng tài khoản có sẵn (customerUserId) nếu được truyền,
    /// ngược lại tạo mới 1 tài khoản Role=Customer từ các field newCustomer* (chưa SaveChanges —
    /// caller chịu trách nhiệm gọi SaveChangesAsync trong cùng transaction với các thay đổi khác).
    /// </summary>
    private async Task<User> ResolveCustomerAsync(
        Guid? customerUserId, string? newCustomerFullName, string? newCustomerEmail,
        string? newCustomerPassword, string? newCustomerPhoneNumber, CancellationToken ct)
    {
        if (customerUserId is not null)
        {
            return await _uow.Users.GetByIdAsync(customerUserId.Value, ct)
                ?? throw new NotFoundException(nameof(User), customerUserId.Value);
        }

        if (string.IsNullOrWhiteSpace(newCustomerFullName)
            || string.IsNullOrWhiteSpace(newCustomerEmail)
            || string.IsNullOrWhiteSpace(newCustomerPassword))
        {
            throw new BadRequestException(
                "Cần chọn khách hàng có sẵn (CustomerUserId) hoặc nhập đủ họ tên/email/mật khẩu để tạo tài khoản khách hàng mới.");
        }

        if (newCustomerPassword.Length < 6)
            throw new BadRequestException("Mật khẩu tài khoản khách hàng mới phải có ít nhất 6 ký tự.");

        var existing = await _uow.Users.FirstOrDefaultAsync(u => u.Email == newCustomerEmail, ct);
        if (existing is not null)
            throw new ConflictException("Email này đã được đăng ký.");

        var newCustomer = new User
        {
            FullName = newCustomerFullName,
            Email = newCustomerEmail,
            PhoneNumber = newCustomerPhoneNumber,
            PasswordHash = _passwordHasher.Hash(newCustomerPassword),
            Role = UserRole.Customer,
            IsActive = true
        };

        await _uow.Users.AddAsync(newCustomer, ct);
        return newCustomer;
    }

    /// <summary>
    /// Map sang DTO, tự fetch Vehicle/CustomerUser/FixedSlot nếu chưa được load kèm (vì
    /// IRepository.Query()/GetByIdAsync không hỗ trợ Include — xem ghi chú tương tự ở SlotService).
    /// Nếu contract được truyền vào đã tự gán sẵn navigation (như lúc CreateAsync) thì không cần fetch lại.
    /// </summary>
    private async Task<MonthlyContractDto> MapToDtoAsync(MonthlyContract c, CancellationToken ct)
    {
        var vehicle = c.Vehicle ?? await _uow.Vehicles.GetByIdAsync(c.VehicleId, ct);
        var customer = c.CustomerUser ?? await _uow.Users.GetByIdAsync(c.CustomerUserId, ct);

        ParkingSlot? fixedSlot = c.FixedSlot;
        if (fixedSlot is null && c.FixedSlotId is not null)
            fixedSlot = await _uow.ParkingSlots.GetByIdAsync(c.FixedSlotId.Value, ct);

        return new MonthlyContractDto(
            c.Id,
            vehicle?.LicensePlate ?? "N/A",
            vehicle?.PhotoUrl,
            c.CustomerUserId,
            customer?.FullName ?? "N/A",
            c.FixedSlotId,
            fixedSlot?.Code,
            c.StartDate,
            c.EndDate,
            c.MonthlyFee,
            c.Status.ToString(),
            c.AutoRenew);
    }
}
