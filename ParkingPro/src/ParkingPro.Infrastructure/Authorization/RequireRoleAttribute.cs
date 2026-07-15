using Microsoft.AspNetCore.Authorization;

namespace ParkingPro.Infrastructure.Authorization;

/// <summary>
/// Attribute áp lên Controller/Action để yêu cầu 1 hoặc nhiều role.
/// Ví dụ: [RequireRole("Admin", "Manager")]
/// </summary>
public class RequireRoleAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "RequireRole_";

    public RequireRoleAttribute(params string[] roles)
    {
        Policy = PolicyPrefix + string.Join(",", roles);
    }
}
