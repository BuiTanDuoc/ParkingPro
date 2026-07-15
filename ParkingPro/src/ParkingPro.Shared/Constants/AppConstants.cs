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
}
