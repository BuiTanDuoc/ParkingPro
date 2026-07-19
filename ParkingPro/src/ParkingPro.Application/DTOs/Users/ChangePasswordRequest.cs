namespace ParkingPro.Application.DTOs.Users;

/// <param name="CurrentPassword">Mật khẩu hiện tại — bắt buộc xác thực đúng trước khi đổi.</param>
/// <param name="NewPassword">Mật khẩu mới (tối thiểu 6 ký tự).</param>
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
