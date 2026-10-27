import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';

import '../network_info.dart';

class ConnectivityInterceptor extends Interceptor {
  final NetworkInfo networkInfo;

  ConnectivityInterceptor(this.networkInfo);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final isConnected = await networkInfo.isConnected;

    if (!isConnected) {
      return handler.reject(
        DioException(
          requestOptions: options,
          type: DioExceptionType.connectionError,
        ),
      );
    }

    handler.next(options);
  }
}

class ApiInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Add the access token from secure storage here when auth is built.
    // Never log the token. Refresh must be single-flight (QueuedInterceptor).
    super.onRequest(options, handler);
  }
}

/// Debug-only network logging with secrets redacted.
class LoggingInterceptor extends Interceptor {
  static const _redacted = '<redacted>';
  static const sensitiveHeaders = {
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'proxy-authorization',
  };
  static const _sensitivePathParts = ['auth', 'login', 'token', 'password'];

  final Logger _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 0,
      printEmojis: true,
      dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
    ),
  );

  /// Returns a copy of [headers] with sensitive values replaced.
  static Map<String, dynamic> redactHeaders(Map<String, dynamic> headers) => {
    for (final entry in headers.entries)
      entry.key: sensitiveHeaders.contains(entry.key.toLowerCase())
          ? _redacted
          : entry.value,
  };

  /// Whether the body of a request to [path] must never be logged.
  static bool isSensitivePath(String path) {
    final lower = path.toLowerCase();
    return _sensitivePathParts.any(lower.contains);
  }

  static String _short(Object? data) {
    final text = '$data';
    return text.length > 1000 ? '${text.substring(0, 1000)}...' : text;
  }

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      final body = isSensitivePath(options.path) ? _redacted : _short(options.data);
      _logger.i(
        'REQUEST[${options.method}] => ${options.uri}\n'
        'Headers: ${redactHeaders(options.headers)}\n'
        'Data: $body',
      );
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      final path = response.requestOptions.path;
      final body = isSensitivePath(path) ? _redacted : _short(response.data);
      _logger.d(
        'RESPONSE[${response.statusCode}] => ${response.requestOptions.uri}\n'
        'Data: $body',
      );
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      _logger.e(
        'ERROR[${err.response?.statusCode}] => ${err.requestOptions.uri}\n'
        'Type: ${err.type}\nMessage: ${err.message}',
      );
    }
    handler.next(err);
  }
}
