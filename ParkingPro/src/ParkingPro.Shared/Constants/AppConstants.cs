namespace ParkingPro.Shared.Constants;

public static class AppConstants
{
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Manager = "Manager";
        public const string Staff = "Staff";
        public const string Customer = "Customer";
    }

    public static class Defaults
    {
        public const int DefaultPageSize = 20;
        public const int MaxPageSize = 100;
        public const int RefreshTokenExpirationDays = 30;
        public const int MonthlyContractExpiringSoonDays = 7;
    }

    /// <summary>
    /// Ảnh mặc định dùng khi người dùng/nhân viên không upload ảnh (avatar, ảnh xe, ảnh check-in/out).
    /// Các file .svg tương ứng đặt sẵn tại wwwroot/uploads/defaults của ParkingPro.API.
    /// </summary>
    public static class DefaultPhotos
    {
        public const string DefaultAvatarUrl = "/uploads/defaults/default-avatar.svg";
        public const string DefaultVehiclePhotoUrl = "/uploads/defaults/default-vehicle.svg";
        public const string DefaultCheckInPhotoUrl = "/uploads/defaults/default-checkin.svg";
        public const string DefaultCheckOutPhotoUrl = "/uploads/defaults/default-checkout.svg";
    }
}
