import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:logging/logging.dart';
import 'package:signalr_netcore/signalr_client.dart';

class SignalRService {
  SignalRService();

  HubConnection? _connection;
  bool _isConnected = false;
  String? _currentCaseId;

  // StreamControllers to expose events
  final _connectionStatusController = StreamController<bool>.broadcast();
  final _jobStatusChangedController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _jobCompletedController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _jobFailedController =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<bool> get onConnectionStatusChanged =>
      _connectionStatusController.stream;
  Stream<Map<String, dynamic>> get onJobStatusChanged =>
      _jobStatusChangedController.stream;
  Stream<Map<String, dynamic>> get onJobCompleted =>
      _jobCompletedController.stream;
  Stream<Map<String, dynamic>> get onJobFailed => _jobFailedController.stream;

  bool get isConnected => _isConnected;

  String? _accessToken;

  void init(String hubUrl, {String? accessToken}) {
    _accessToken = accessToken;
    Logger.root.level = Level.WARNING;
    Logger.root.onRecord.listen((LogRecord rec) {
      if (kDebugMode) {
        print('${rec.level.name}: ${rec.time}: ${rec.message}');
      }
    });

    final options = HttpConnectionOptions(
      accessTokenFactory: () async => _accessToken ?? '',
      logMessageContent: true,
    );

    _connection = HubConnectionBuilder()
        .withUrl(hubUrl, options: options)
        .withAutomaticReconnect()
        .build();

    _connection?.onclose(({Exception? error}) {
      _isConnected = false;
      _connectionStatusController.add(false);
      if (kDebugMode) {
        print('SignalR connection closed: $error');
      }
    });

    _connection?.onreconnecting(({Exception? error}) {
      _isConnected = false;
      _connectionStatusController.add(false);
      if (kDebugMode) {
        print('SignalR connection reconnecting: $error');
      }
    });

    _connection?.onreconnected(({String? connectionId}) {
      _isConnected = true;
      _connectionStatusController.add(true);
      if (kDebugMode) {
        print('SignalR connection reconnected: $connectionId');
      }
      // Re-join the active case if we had one
      if (_currentCaseId != null) {
        joinCase(_currentCaseId!);
      }
    });

    // Register event handlers
    _connection?.on('JobStatusChanged', _handleJobStatusChanged);
    _connection?.on('JobCompleted', _handleJobCompleted);
    _connection?.on('JobFailed', _handleJobFailed);
  }

  Future<void> connect() async {
    if (_connection == null) return;
    if (_isConnected) return;

    try {
      await _connection!.start();
      _isConnected = true;
      _connectionStatusController.add(true);
      if (kDebugMode) {
        print('SignalR connection established successfully');
      }
    } catch (e) {
      _isConnected = false;
      _connectionStatusController.add(false);
      if (kDebugMode) {
        print('SignalR connection failed to start: $e');
      }
      rethrow;
    }
  }

  Future<void> disconnect() async {
    if (_connection == null) return;
    try {
      await _connection!.stop();
      _isConnected = false;
      _connectionStatusController.add(false);
      _currentCaseId = null;
      if (kDebugMode) {
        print('SignalR disconnected successfully');
      }
    } catch (e) {
      if (kDebugMode) {
        print('SignalR disconnect error: $e');
      }
    }
  }

  Future<void> joinCase(String caseId) async {
    _currentCaseId = caseId;
    if (_connection == null || !_isConnected) return;

    try {
      await _connection!.invoke('JoinCase', args: <Object>[caseId]);
      if (kDebugMode) {
        print('Successfully joined case group: case-$caseId');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to invoke JoinCase: $e');
      }
    }
  }

  Future<void> leaveCase(String caseId) async {
    if (caseId == _currentCaseId) {
      _currentCaseId = null;
    }
    if (_connection == null || !_isConnected) return;

    try {
      await _connection!.invoke('LeaveCase', args: <Object>[caseId]);
      if (kDebugMode) {
        print('Successfully left case group: case-$caseId');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to invoke LeaveCase: $e');
      }
    }
  }

  void _handleJobStatusChanged(List<Object?>? arguments) {
    if (arguments != null && arguments.isNotEmpty) {
      final jobData = arguments[0];
      if (jobData is Map<String, dynamic>) {
        _jobStatusChangedController.add(jobData);
      } else if (jobData != null) {
        try {
          final Map<String, dynamic> parsed = Map<String, dynamic>.from(
            jobData as Map,
          );
          _jobStatusChangedController.add(parsed);
        } catch (e) {
          if (kDebugMode) {
            print('Error parsing JobStatusChanged arg: $e');
          }
        }
      }
    }
  }

  void _handleJobCompleted(List<Object?>? arguments) {
    if (arguments != null && arguments.isNotEmpty) {
      final jobData = arguments[0];
      if (jobData is Map<String, dynamic>) {
        _jobCompletedController.add(jobData);
      } else if (jobData != null) {
        try {
          final Map<String, dynamic> parsed = Map<String, dynamic>.from(
            jobData as Map,
          );
          _jobCompletedController.add(parsed);
        } catch (e) {
          if (kDebugMode) {
            print('Error parsing JobCompleted arg: $e');
          }
        }
      }
    }
  }

  void _handleJobFailed(List<Object?>? arguments) {
    if (arguments != null && arguments.isNotEmpty) {
      final jobData = arguments[0];
      if (jobData is Map<String, dynamic>) {
        _jobFailedController.add(jobData);
      } else if (jobData != null) {
        try {
          final Map<String, dynamic> parsed = Map<String, dynamic>.from(
            jobData as Map,
          );
          _jobFailedController.add(parsed);
        } catch (e) {
          if (kDebugMode) {
            print('Error parsing JobFailed arg: $e');
          }
        }
      }
    }
  }

  void dispose() {
    _connectionStatusController.close();
    _jobStatusChangedController.close();
    _jobCompletedController.close();
    _jobFailedController.close();
  }
}
