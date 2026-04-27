using System.Collections.Generic;

namespace Lawyer.Application.Models
{
    public class PaginatedList<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }

        public PaginatedList() { }

        public PaginatedList(List<T> items, int count, int page, int pageSize)
        {
            Page = page;
            PageSize = pageSize;
            TotalPages = (int)System.Math.Ceiling(count / (double)pageSize);
            TotalCount = count;
            Items = items;
        }
    }
}
