using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace ParkingPro.Infrastructure.Authorization;

/// <summary>
/// Sinh AuthorizationPolicy động dựa trên tên policy "RequireRole_Admin,Manager"
/// thay vì phải khai báo policy cứng cho từng tổ hợp role trong Program.cs.
/// </summary>
public class RolePolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallbackProvider;

    public RolePolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallbackProvider = new DefaultAuthorizationPolicyProvider(options);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => _fallbackProvider.GetDefaultPolicyAsync();

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => _fallbackProvider.GetFallbackPolicyAsync();

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith(RequireRoleAttribute.PolicyPrefix, StringComparison.OrdinalIgnoreCase))
        {
            var roles = policyName[RequireRoleAttribute.PolicyPrefix.Length..].Split(',', StringSplitOptions.RemoveEmptyEntries);

            var policy = new AuthorizationPolicyBuilder()
                .AddRequirements(new RoleRequirement(roles))
                .Build();

            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        return _fallbackProvider.GetPolicyAsync(policyName);
    }
}
