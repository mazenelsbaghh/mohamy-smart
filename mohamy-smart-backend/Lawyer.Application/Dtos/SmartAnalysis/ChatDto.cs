using System;
using System.Collections.Generic;

namespace Lawyer.Application.Dtos.SmartAnalysis
{
    public class ChatRequestDto
    {
        public string Message { get; set; } = string.Empty;
        public Guid? ConversationId { get; set; }
        public Guid? ContextCaseId { get; set; }
        public List<Guid> InternalRegulationIds { get; set; } = new();
    }

    public class ChatResponseDto
    {
        public Guid ConversationId { get; set; }
        public List<ChatMessageDto> Messages { get; set; } = new();
        public string AvailabilityState { get; set; } = string.Empty;
    }

    public class ChatMessageDto
    {
        public Guid MessageId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
