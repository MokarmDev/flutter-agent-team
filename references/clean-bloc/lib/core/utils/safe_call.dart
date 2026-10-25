import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../errors/failures.dart';
import 'logger.dart';

/// Runs [call] and converts any thrown error into a user-safe [Failure].
///
/// Technical details are logged (debug builds only) and never shown to users.
Future<Either<Failure, T>> safeCall<T>(Future<T> Function() call) async {
  try {
    final result = await call();
    return Right(result);
  } on DioException catch (e) {
    return Left(failureFromDioException(e));
  } on Failure catch (failure) {
    return Left(failure);
  } on FormatException catch (e, stackTrace) {
    AppLogger.error('Could not parse the server response', e, stackTrace);
    return const Left(
      ServerFailure('We could not read the server response.'),
    );
  } catch (e, stackTrace) {
    AppLogger.error('Unexpected error in safeCall', e, stackTrace);
    return const Left(ServerFailure());
  }
}
