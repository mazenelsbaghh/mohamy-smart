import 'package:mohamy_smart_mobile/core/services/signalr_service.dart';

class FakeSignalRService extends SignalRService {
  @override
  void init(String hubUrl, {String? accessToken}) {
    // No-op to avoid building HubConnection and starting timers in tests
  }

  @override
  Future<void> connect() async {
    // Return immediately without attempting network calls
  }

  @override
  Future<void> disconnect() async {
    // Return immediately
  }

  @override
  Future<void> joinCase(String caseId) async {
    // Return immediately
  }

  @override
  Future<void> leaveCase(String caseId) async {
    // Return immediately
  }
}
