using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using ProductApi.Data;

#nullable disable

namespace ProductApi.Migrations;

[DbContext(typeof(AppDbContext))]
public partial class AppDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
        modelBuilder.HasAnnotation("ProductVersion", "10.0.0");
        modelBuilder.Entity("ProductApi.Models.Product", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("INTEGER")
                .HasAnnotation("Sqlite:Autoincrement", true);
            b.Property<string>("Name").IsRequired().HasMaxLength(120).HasColumnType("TEXT");
            b.Property<long>("Price").HasColumnType("INTEGER");
            b.Property<int>("Quantity").HasColumnType("INTEGER");
            b.Property<string>("Description").HasMaxLength(500).HasColumnType("TEXT");
            b.HasKey("Id");
            b.ToTable("Products");
        });
        modelBuilder.Entity("ProductApi.Models.User", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("INTEGER")
                .HasAnnotation("Sqlite:Autoincrement", true);
            b.Property<string>("Email").IsRequired().HasMaxLength(254).HasColumnType("TEXT");
            b.Property<string>("NormalizedEmail").IsRequired().HasMaxLength(254).HasColumnType("TEXT");
            b.Property<string>("PasswordHash").IsRequired().HasColumnType("TEXT");
            b.Property<DateTime>("CreatedAtUtc").HasColumnType("TEXT");
            b.HasKey("Id");
            b.HasIndex("NormalizedEmail").IsUnique();
            b.ToTable("Users");
        });
    }
}
