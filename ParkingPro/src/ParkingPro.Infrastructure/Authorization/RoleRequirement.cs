using Microsoft.AspNetCore.Authorization;

namespace ParkingPro.Infrastructure.Authorization;

public class RoleRequirement : IAuthorizationRequirement
{
    public string[] AllowedRoles { get; }

    public RoleRequirement(string[] allowedRoles)
    {
        AllowedRoles = allowedRoles;
    }
}
