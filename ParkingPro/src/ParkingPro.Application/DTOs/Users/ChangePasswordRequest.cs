namespace ParkingPro.Application.DTOs.Users;

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
