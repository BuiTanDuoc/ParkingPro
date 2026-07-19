namespace ParkingPro.Application.Common;

/// <summary>Kết quả phân trang dùng chung cho các API danh sách.</summary>
/// <typeparam name="T">Kiểu dữ liệu của từng phần tử.</typeparam>
public class PagedResult<T>
{
    /// <summary>Danh sách phần tử của trang hiện tại.</summary>
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();

    /// <summary>Số trang hiện tại (bắt đầu từ 1).</summary>
    public int PageNumber { get; init; }

    /// <summary>Số phần tử tối đa mỗi trang.</summary>
    public int PageSize { get; init; }

    /// <summary>Tổng số phần tử thỏa điều kiện lọc (trên toàn bộ các trang).</summary>
    public int TotalCount { get; init; }

    /// <summary>Tổng số trang, tính từ TotalCount và PageSize.</summary>
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}
