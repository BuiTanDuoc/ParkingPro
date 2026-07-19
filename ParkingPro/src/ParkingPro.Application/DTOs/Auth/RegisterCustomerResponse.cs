namespace ParkingPro.Application.DTOs.Auth;

/// <summary>Kết quả đăng ký tài khoản khách hàng thành công.</summary>
/// <param name="Id">Id của tài khoản vừa tạo.</param>
public record RegisterCustomerResponse(Guid Id);
