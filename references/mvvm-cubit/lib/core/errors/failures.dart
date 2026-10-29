import 'package:dio/dio.dart';
import 'package:equatable/equatable.dart';

import 'api_error_parser.dart';

/// Base type for every error that reaches the UI.
///
/// Messages are user-safe: never put stack traces, URLs or tokens in them.
abstract class Failure extends Equatable {
  final String message;

  const Failure(this.message);

  @override
  List<Object?> get props => [message];
}

class ServerFailure extends Failure {
  const ServerFailure([
    super.message = 'Something went wrong. Please try again.',
  ]);

  factory ServerFailure.fromDioError(DioException e) {
    final failure = failureFromDioException(e);
    if (failure is ServerFailure) return failure;
    return ServerFailure(failure.message);
  }
}

class NetworkFailure extends Failure {
  const NetworkFailure([
    super.message = 'No internet connection. Please check your network.',
  ]);
}

class CacheFailure extends Failure {
  const CacheFailure(super.message);
}

class CacheNotFoundFailure extends CacheFailure {
  const CacheNotFoundFailure([
    super.message = 'Requested data not found in cache.',
  ]);
}

class AuthFailure extends Failure {
  const AuthFailure(super.message);
}

class TokenExpiredFailure extends AuthFailure {
  const TokenExpiredFailure([
    super.message = 'Session expired. Please log in again.',
  ]);
}

class UnauthorizedFailure extends AuthFailure {
  const UnauthorizedFailure([String? message])
    : super(message ?? 'You are not authorized to perform this action.');
}

class ForbiddenFailure extends Failure {
  const ForbiddenFailure([
    super.message = 'You do not have permission to do this.',
  ]);
}

class NotFoundFailure extends Failure {
  const NotFoundFailure([super.message = 'The requested item was not found.']);
}

/// The request was cancelled (for example the screen closed). Usually not shown.
class CancelledFailure extends Failure {
  const CancelledFailure([super.message = 'The request was cancelled.']);
}

/// Server-side validation errors (HTTP 422, or 400 with field errors).
///
/// [fieldErrors] maps a field name to its messages, for example
/// `{'email': ['The email has already been taken.']}`.
class ValidationFailure extends Failure {
  final Map<String, List<String>> fieldErrors;

  const ValidationFailure(super.message, {this.fieldErrors = const {}});

  /// First message for [field], or null. Handy for `InputDecoration.errorText`.
  String? errorFor(String field) {
    final errors = fieldErrors[field];
    return (errors == null || errors.isEmpty) ? null : errors.first;
  }

  @override
  List<Object?> get props => [message, fieldErrors];
}

/// Maps a [DioException] to a [Failure]. Used by `safeCall`.
Failure failureFromDioException(DioException exception) {
  switch (exception.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.connectionError:
      return const NetworkFailure();
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
      return const NetworkFailure(
        'The server took too long to respond. Please try again.',
      );
    case DioExceptionType.badCertificate:
      return const ServerFailure('A secure connection could not be made.');
    case DioExceptionType.badResponse:
      final response = exception.response;
      return failureFromResponse(response?.statusCode ?? 0, response?.data);
    case DioExceptionType.cancel:
      return const CancelledFailure();
    case DioExceptionType.unknown:
      return const ServerFailure();
  }
}

/// Maps an HTTP error status and body to a [Failure].
Failure failureFromResponse(int statusCode, dynamic body) {
  final fieldErrors = ApiErrorParser.parseFieldErrors(body);
  final serverMessage = ApiErrorParser.parseMessage(body);

  if (statusCode == 422 || (statusCode == 400 && fieldErrors.isNotEmpty)) {
    return ValidationFailure(serverMessage, fieldErrors: fieldErrors);
  }
  if (statusCode == 400) return ServerFailure(serverMessage);
  if (statusCode == 401) return UnauthorizedFailure(serverMessage);
  if (statusCode == 403) return const ForbiddenFailure();
  if (statusCode == 404) return const NotFoundFailure();
  if (statusCode == 409) return ServerFailure(serverMessage);
  if (statusCode == 429) {
    return const ServerFailure(
      'Too many requests. Please wait a moment and try again.',
    );
  }
  if (statusCode >= 500) {
    return const ServerFailure('Server error. Please try again later.');
  }
  return const ServerFailure();
}
