using ParkingPro.Application.Common;
using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.Users;
using ParkingPro.Application.Interfaces;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;
using ParkingPro.Shared.Constants;

namespace ParkingPro.Application.Services;

public class UserService : IUserService
{
    private static readonly UserRole[] StaffCreatableRoles = { UserRole.Staff, UserRole.Manager, UserRole.Admin };

    private readonly IUnitOfWork _uow;
    private readonly IFileStorageService _fileStorage;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IUnitOfWork uow, IFileStorageService fileStorage, IPasswordHasher passwordHasher)
    {
        _uow = uow;
        _fileStorage = fileStorage;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _uow.Users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException(nameof(User), userId);

        return MapToDto(user);
    }

    public async Task<string> UpdateAvatarAsync(Guid userId, Stream photoStream, string photoFileName, CancellationToken ct = default)
    {
        var user = await _uow.Users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException(nameof(User), userId);

        user.AvatarUrl = await _fileStorage.SaveAsync(photoStream, photoFileName, "avatars", ct);
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);

        return user.AvatarUrl;
    }

    public async Task<PagedResult<UserProfileDto>> GetAllUsersAsync(string? role, int pageNumber, int pageSize, CancellationToken ct = default)
    {
        var query = _uow.Users.Query();

        if (!string.IsNullOrWhiteSpace(role))
        {
            if (!Enum.TryParse<UserRole>(role, true, out var parsedRole))
                throw new BadRequestException($"Role '{role}' không hợp lệ.");
            query = query.Where(u => u.Role == parsedRole);
        }

        query = query.OrderBy(u => u.Role).ThenBy(u => u.FullName);

        var totalCount = query.Count();
        var items = query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        return new PagedResult<UserProfileDto>
        {
            Items = items.Select(MapToDto).ToList(),
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<UserProfileDto> CreateStaffUserAsync(CreateStaffUserRequest request, CancellationToken ct = default)
    {
        if (!Enum.TryParse<UserRole>(request.Role, true, out var role) || !StaffCreatableRoles.Contains(role))
            throw new BadRequestException("Role phải là Staff, Manager hoặc Admin (dùng /api/auth/register-customer cho khách hàng).");

        var existing = await _uow.Users.FirstOrDefaultAsync(u => u.Email == request.Email, ct);
        if (existing is not null)
            throw new ConflictException("Email này đã được đăng ký.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = role,
            IsActive = true
        };

        await _uow.Users.AddAsync(user, ct);
        await _uow.SaveChangesAsync(ct);

        return MapToDto(user);
    }

    public async Task SetActiveStatusAsync(Guid userId, bool isActive, CancellationToken ct = default)
    {
        var user = await _uow.Users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException(nameof(User), userId);

        user.IsActive = isActive;
        _uow.Users.Update(user);
        await _uow.SaveChangesAsync(ct);
    }

    private static UserProfileDto MapToDto(User u) => new(
        u.Id,
        u.FullName,
        u.Email,
        u.PhoneNumber,
        u.Role.ToString(),
        string.IsNullOrEmpty(u.AvatarUrl) ? AppConstants.DefaultPhotos.DefaultAvatarUrl : u.AvatarUrl,
        u.IsActive);
}
