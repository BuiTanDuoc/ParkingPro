using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace ParkingPro.Infrastructure.Authorization;

public class RoleAuthorizationHandler : AuthorizationHandler<RoleRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, RoleRequirement requirement)
    {
        var userRole = context.User.FindFirstValue(ClaimTypes.Role);

        if (userRole is not null && requirement.AllowedRoles.Contains(userRole, StringComparer.OrdinalIgnoreCase))
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
