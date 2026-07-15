using FluentAssertions;
using Moq;
using ParkingPro.Application.Interfaces.Repositories;
using ParkingPro.Application.Services;
using ParkingPro.Domain.Entities;
using ParkingPro.Domain.Enums;
using Xunit;

namespace ParkingPro.UnitTests;

public class PricingServiceTests
{
    [Fact]
    public async Task CalculateSessionFeeAsync_TheoGio_TinhDungGiaGioDauVaGioTiepTheo()
    {
        // Arrange
        var parkingLotId = Guid.NewGuid();
        var vehicle = new Vehicle { Id = Guid.NewGuid(), LicensePlate = "51A-12345", Type = VehicleType.OToDuoi7Cho };

        var session = new ParkingSession
        {
            ParkingLotId = parkingLotId,
            VehicleId = vehicle.Id,
            SessionType = SessionType.TheoGio,
            CheckInAtUtc = new DateTime(2026, 7, 15, 8, 0, 0, DateTimeKind.Utc),
            CheckOutAtUtc = new DateTime(2026, 7, 15, 10, 30, 0, DateTimeKind.Utc) // 2.5h -> làm tròn lên 3h
        };

        var plan = new PricingPlan
        {
            ParkingLotId = parkingLotId,
            SessionType = SessionType.TheoGio,
            VehicleType = VehicleType.OToDuoi7Cho,
            FirstHourPrice = 20000m,
            NextHourPrice = 15000m,
            IsActive = true
        };

        var vehicleRepo = new Mock<IRepository<Vehicle>>();
        vehicleRepo.Setup(r => r.GetByIdAsync(vehicle.Id, It.IsAny<CancellationToken>())).ReturnsAsync(vehicle);

        var pricingRepo = new Mock<IRepository<PricingPlan>>();
        pricingRepo.Setup(r => r.FirstOrDefaultAsync(
                It.IsAny<System.Linq.Expressions.Expression<Func<PricingPlan, bool>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(plan);

        var uow = new Mock<IUnitOfWork>();
        uow.SetupGet(u => u.Vehicles).Returns(vehicleRepo.Object);
        uow.SetupGet(u => u.PricingPlans).Returns(pricingRepo.Object);

        var sut = new PricingService(uow.Object);

        // Act
        var fee = await sut.CalculateSessionFeeAsync(session);

        // Assert: giờ đầu 20,000 + 2 giờ tiếp theo x 15,000 = 50,000
        fee.Should().Be(50000m);
    }
}
