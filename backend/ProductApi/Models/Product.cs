using System.ComponentModel.DataAnnotations;

namespace ProductApi.Models;

public class Product
{
    public int Id { get; set; }

    [Required, StringLength(120)]
    public string Name { get; set; } = string.Empty;

    [Range(0, long.MaxValue)]
    public long Price { get; set; }

    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }
}
