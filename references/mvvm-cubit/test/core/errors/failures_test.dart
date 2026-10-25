import 'package:dio/dio.dart';
import 'package:flutter_mvvm_template/core/errors/api_error_parser.dart';
import 'package:flutter_mvvm_template/core/errors/failures.dart';
import 'package:flutter_test/flutter_test.dart';

DioException _bad(int status, dynamic data) => DioException(
  requestOptions: RequestOptions(path: '/x'),
  type: DioExceptionType.badResponse,
  response: Response(
    requestOptions: RequestOptions(path: '/x'),
    statusCode: status,
    data: data,
  ),
);

void main() {
  test('422 with Laravel errors becomes ValidationFailure with field errors', () {
    final failure = failureFromDioException(_bad(422, {
      'message': 'The given data was invalid.',
      'errors': {
        'email': ['The email has already been taken.'],
        'name': 'The name field is required.',
      },
    }));

    expect(failure, isA<ValidationFailure>());
    final validation = failure as ValidationFailure;
    expect(validation.message, 'The given data was invalid.');
    expect(validation.errorFor('email'), 'The email has already been taken.');
    expect(validation.errorFor('name'), 'The name field is required.');
    expect(validation.errorFor('phone'), isNull);
  });

  test('connection problems become NetworkFailure', () {
    for (final type in [
      DioExceptionType.connectionError,
      DioExceptionType.connectionTimeout,
      DioExceptionType.receiveTimeout,
    ]) {
      final failure = failureFromDioException(
        DioException(requestOptions: RequestOptions(path: '/x'), type: type),
      );
      expect(failure, isA<NetworkFailure>(), reason: '$type');
    }
  });

  test('status codes map to specific failures', () {
    expect(failureFromDioException(_bad(401, null)), isA<UnauthorizedFailure>());
    expect(failureFromDioException(_bad(403, null)), isA<ForbiddenFailure>());
    expect(failureFromDioException(_bad(404, null)), isA<NotFoundFailure>());
    expect(failureFromDioException(_bad(503, 'down')), isA<ServerFailure>());
  });

  test('a bad response without a response object does not crash', () {
    final failure = failureFromDioException(
      DioException(
        requestOptions: RequestOptions(path: '/x'),
        type: DioExceptionType.badResponse,
      ),
    );
    expect(failure, isA<ServerFailure>());
  });

  test('cancelled requests become CancelledFailure', () {
    final failure = failureFromDioException(
      DioException(
        requestOptions: RequestOptions(path: '/x'),
        type: DioExceptionType.cancel,
      ),
    );
    expect(failure, isA<CancelledFailure>());
  });

  test('parser falls back to a generic message', () {
    expect(ApiErrorParser.parseMessage(null), ApiErrorParser.fallbackMessage);
    expect(ApiErrorParser.parseMessage(42), ApiErrorParser.fallbackMessage);
    expect(ApiErrorParser.parseFieldErrors('text'), isEmpty);
  });
}
