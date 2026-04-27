using Lawyer.Application.DTOs.Client;
using Lawyer.Application.Interfaces;
using Lawyer.Core.Exceptions;
using Lawyer.Core.IRepositories;
using Lawyer.Core.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Lawyer.Application.Services
{
    public class DocumentHandoffService : IDocumentHandoffService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DocumentHandoffService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<IEnumerable<DocumentHandoffDto>>> GetByClientAsync(Guid clientId)
        {
            try
            {
                var items = await _unitOfWork.Repository<DocumentHandoff>()
                    .AsQueryable()
                    .Where(d => d.ClientId == clientId)
                    .OrderByDescending(d => d.DeliveryDate)
                    .Select(d => new DocumentHandoffDto
                    {
                        Id = d.Id,
                        ClientId = d.ClientId,
                        DocumentName = d.DocumentName,
                        DeliveryDate = d.DeliveryDate,
                        ReceiptFilePath = d.ReceiptFilePath,
                        CreatedAt = d.Created
                    })
                    .ToListAsync();

                return Result<IEnumerable<DocumentHandoffDto>>.Success(items);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<DocumentHandoffDto>>.Error(
                    System.Net.HttpStatusCode.InternalServerError,
                    "An error occurred while fetching document handoffs.");
            }
        }

        public async Task<Result<DocumentHandoffDto>> CreateAsync(CreateDocumentHandoffDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                string? receiptPath = null;

                if (dto.ReceiptFile != null && dto.ReceiptFile.Length > 0)
                {
                    var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".webp" };
                    var ext = Path.GetExtension(dto.ReceiptFile.FileName).ToLowerInvariant();
                    if (string.IsNullOrEmpty(ext) || !allowedExtensions.Contains(ext))
                        return Result<DocumentHandoffDto>.Error(System.Net.HttpStatusCode.BadRequest, $"File type '{ext}' is not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");

                    var uploadsDir = Path.Combine("wwwroot", "uploads", "receipts");
                    Directory.CreateDirectory(uploadsDir);
                    var fileName = $"{Guid.NewGuid()}_{dto.ReceiptFile.FileName}";
                    var fullPath = Path.Combine(uploadsDir, fileName);
                    using var stream = new FileStream(fullPath, FileMode.Create);
                    await dto.ReceiptFile.CopyToAsync(stream);
                    receiptPath = $"/uploads/receipts/{fileName}";
                }

                var entity = new DocumentHandoff
                {
                    ClientId = dto.ClientId,
                    DocumentName = dto.DocumentName,
                    DeliveryDate = dto.DeliveryDate,
                    ReceiptFilePath = receiptPath
                };

                await _unitOfWork.Repository<DocumentHandoff>().AddAsync(entity);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return Result<DocumentHandoffDto>.Success(new DocumentHandoffDto
                {
                    Id = entity.Id,
                    ClientId = entity.ClientId,
                    DocumentName = entity.DocumentName,
                    DeliveryDate = entity.DeliveryDate,
                    ReceiptFilePath = entity.ReceiptFilePath,
                    CreatedAt = entity.Created
                });
            }
            catch (Exception ex)
            {
                return Result<DocumentHandoffDto>.Error(
                    System.Net.HttpStatusCode.InternalServerError,
                    "An error occurred while creating the document handoff.");
            }
        }
    }
}
