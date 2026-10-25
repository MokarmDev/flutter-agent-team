import 'package:dio/dio.dart';
import 'package:flutter_clean_architecture_template/core/errors/failures.dart';
import 'package:flutter_clean_architecture_template/core/utils/safe_call.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('returns the value on success', () async {
    final result = await safeCall(() async => 42);
    expect(result.getOrElse(() => 0), 42);
  });

  test('never exposes exception text to the user', () async {
    final result = await safeCall<int>(
      () async => throw StateError('secret internal detail at /api?token=abc'),
    );
    result.fold(
      (failure) {
        expect(failure, isA<ServerFailure>());
        expect(failure.message, isNot(contains('secret')));
        expect(failure.message, isNot(contains('token')));
      },
      (_) => fail('expected a failure'),
    );
  });

  test('maps DioException through failureFromDioException', () async {
    final result = await safeCall<int>(
      () async => throw DioException(
        requestOptions: RequestOptions(path: '/x'),
        type: DioExceptionType.connectionError,
      ),
    );
    expect(result.swap().getOrElse(() => const ServerFailure()), isA<NetworkFailure>());
  });

  test('passes through a thrown Failure', () async {
    final result = await safeCall<int>(() async => throw const NotFoundFailure());
    expect(result.swap().getOrElse(() => const ServerFailure()), isA<NotFoundFailure>());
  });
}
