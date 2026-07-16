using ParkingPro.Application.Common.Exceptions;
using ParkingPro.Application.DTOs.Users;
using ParkingPro.Application.Interfaces;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Interfaces.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Shared.Constants;

namespace ParkingPro.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _uow;
    private readonly IFileStorageService _fileStorage;

    public UserService(IUnitOfWork uow, IFileStorageService fileStorage)
    {
        _uow = uow;
        _fileStorage = fileStorage;
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

    private static UserProfileDto MapToDto(User u) => new(
        u.Id,
        u.FullName,
        u.Email,
        u.PhoneNumber,
        u.Role.ToString(),
        string.IsNullOrEmpty(u.AvatarUrl) ? AppConstants.DefaultPhotos.DefaultAvatarUrl : u.AvatarUrl);
}
