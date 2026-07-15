using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParkingPro.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ParkingLots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TotalSlots = table.Column<int>(type: "int", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParkingLots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PricingPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParkingLotId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionType = table.Column<int>(type: "int", nullable: false),
                    VehicleType = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FirstHourPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NextHourPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    OvernightSurcharge = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DailyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    MonthlyPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PricingPlans_ParkingLots_ParkingLotId",
                        column: x => x.ParkingLotId,
                        principalTable: "ParkingLots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Zones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParkingLotId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Floor = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Zones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Zones_ParkingLots_ParkingLotId",
                        column: x => x.ParkingLotId,
                        principalTable: "ParkingLots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecipientUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    SentAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevokedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReplacedByToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReasonRevoked = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FamilyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Shifts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParkingLotId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StaffId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpectedCashAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ActualCashAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shifts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Shifts_ParkingLots_ParkingLotId",
                        column: x => x.ParkingLotId,
                        principalTable: "ParkingLots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Shifts_Users_StaffId",
                        column: x => x.StaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LicensePlate = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OwnerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vehicles_Users_OwnerUserId",
                        column: x => x.OwnerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ParkingSlots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ZoneId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParkingSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParkingSlots_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MonthlyContracts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParkingLotId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FixedSlotId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    MonthlyFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AutoRenew = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlyContracts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MonthlyContracts_ParkingLots_ParkingLotId",
                        column: x => x.ParkingLotId,
                        principalTable: "ParkingLots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MonthlyContracts_ParkingSlots_FixedSlotId",
                        column: x => x.FixedSlotId,
                        principalTable: "ParkingSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MonthlyContracts_Users_CustomerUserId",
                        column: x => x.CustomerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MonthlyContracts_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ParkingSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParkingLotId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VehicleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SlotId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MonthlyContractId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SessionType = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CheckInAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CheckOutAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckInImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CheckOutImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    CheckInStaffId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CheckOutStaffId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParkingSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParkingSessions_MonthlyContracts_MonthlyContractId",
                        column: x => x.MonthlyContractId,
                        principalTable: "MonthlyContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParkingSessions_ParkingLots_ParkingLotId",
                        column: x => x.ParkingLotId,
                        principalTable: "ParkingLots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParkingSessions_ParkingSlots_SlotId",
                        column: x => x.SlotId,
                        principalTable: "ParkingSlots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParkingSessions_Users_CheckInStaffId",
                        column: x => x.CheckInStaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParkingSessions_Users_CheckOutStaffId",
                        column: x => x.CheckOutStaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ParkingSessions_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParkingSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MonthlyContractId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Method = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    TransactionRef = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReceivedByStaffId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaidAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_MonthlyContracts_MonthlyContractId",
                        column: x => x.MonthlyContractId,
                        principalTable: "MonthlyContracts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payments_ParkingSessions_ParkingSessionId",
                        column: x => x.ParkingSessionId,
                        principalTable: "ParkingSessions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Payments_Users_ReceivedByStaffId",
                        column: x => x.ReceivedByStaffId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyContracts_CustomerUserId",
                table: "MonthlyContracts",
                column: "CustomerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyContracts_FixedSlotId",
                table: "MonthlyContracts",
                column: "FixedSlotId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyContracts_ParkingLotId",
                table: "MonthlyContracts",
                column: "ParkingLotId");

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyContracts_VehicleId",
                table: "MonthlyContracts",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId",
                table: "Notifications",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ParkingSessions_CheckInStaffId",
                table: "ParkingSessions",
                column: "CheckInStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_ParkingSessions_CheckOutStaffId",
                table: "ParkingSessions",
                column: "CheckOutStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_ParkingSessions_MonthlyContractId",
                table: "ParkingSessions",
                column: "MonthlyContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ParkingSessions_ParkingLotId",
                table: "ParkingSessions",
                column: "ParkingLotId");

            migrationBuilder.CreateIndex(
                name: "IX_ParkingSessions_SlotId",
                table: "ParkingSessions",
                column: "SlotId");

            migrationBuilder.CreateIndex(
                name: "IX_ParkingSessions_VehicleId",
                table: "ParkingSessions",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_ParkingSlots_ZoneId_Code",
                table: "ParkingSlots",
                columns: new[] { "ZoneId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_MonthlyContractId",
                table: "Payments",
                column: "MonthlyContractId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ParkingSessionId",
                table: "Payments",
                column: "ParkingSessionId",
                unique: true,
                filter: "[ParkingSessionId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReceivedByStaffId",
                table: "Payments",
                column: "ReceivedByStaffId");

            migrationBuilder.CreateIndex(
                name: "IX_PricingPlans_ParkingLotId",
                table: "PricingPlans",
                column: "ParkingLotId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_ParkingLotId",
                table: "Shifts",
                column: "ParkingLotId");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_StaffId",
                table: "Shifts",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_LicensePlate",
                table: "Vehicles",
                column: "LicensePlate");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_OwnerUserId",
                table: "Vehicles",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Zones_ParkingLotId",
                table: "Zones",
                column: "ParkingLotId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "PricingPlans");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropTable(
                name: "ParkingSessions");

            migrationBuilder.DropTable(
                name: "MonthlyContracts");

            migrationBuilder.DropTable(
                name: "ParkingSlots");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "Zones");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "ParkingLots");
        }
    }
}
