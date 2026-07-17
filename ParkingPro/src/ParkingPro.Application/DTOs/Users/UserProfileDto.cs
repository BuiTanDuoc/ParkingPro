namespace ParkingPro.Application.DTOs.Users;

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string? PhoneNumber,
    string Role,
    string AvatarUrl,
    bool IsActive);
