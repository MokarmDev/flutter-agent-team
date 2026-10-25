import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/utils/safe_call.dart';
import '../../../../shared/models/pagination/pagination_params.dart';
import '../models/product/product_entity.dart';
import 'home_repository.dart';
import '../datasources/home_local_data_source.dart';
import '../datasources/home_remote_data_source.dart';

class HomeRepositoryImpl implements HomeRepository {
  final HomeRemoteDataSource remoteDataSource;
  final HomeLocalDataSource localDataSource;

  HomeRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, List<ProductEntity>>> getProduct(
    PaginationParams params,
  ) async {
    final isFirstPage = params.skip == 0;
    final result = await safeCall(() => remoteDataSource.fetchProduct(params));

    return result.fold(
      (failure) {
        // Cached data stands in for the first page only. Returning it for a
        // later page would append the whole cache again and duplicate items.
        if (isFirstPage) {
          final cached = localDataSource.fetchProducts();
          if (cached.isNotEmpty) {
            return Right(cached);
          }
        }
        return Left(failure);
      },
      (remote) async {
        await localDataSource.saveProducts(remote, replace: isFirstPage);
        return Right(remote);
      },
    );
  }
}
