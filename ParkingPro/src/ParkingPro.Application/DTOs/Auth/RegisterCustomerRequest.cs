namespace ParkingPro.Application.DTOs.Auth;

public record RegisterCustomerRequest(
    string FullName,
    string Email,
    string Password,
    string? PhoneNumber);
