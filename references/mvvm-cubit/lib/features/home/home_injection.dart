import '../../core/di/injection_container.dart';
import '../../core/network/api_consumer.dart';
import 'data/datasources/home_local_data_source.dart';
import 'data/datasources/home_remote_data_source.dart';
import 'data/repositories/home_repository.dart';
import 'data/repositories/home_repository_impl.dart';
import 'presentation/manager/product/product_cubit.dart';

void initHome() async {
  // State Management
  sl.registerFactory(() => ProductCubit(sl<HomeRepository>()));

  // Data Sources
  sl.registerLazySingleton<HomeRemoteDataSource>(
    () => HomeRemoteDataSourceImpl(sl<ApiConsumer>()),
  );
  sl.registerLazySingleton<HomeLocalDataSource>(
    () => HomeLocalDataSourceImpl(),
  );

  // Repository
  sl.registerLazySingleton<HomeRepository>(
    () => HomeRepositoryImpl(
      remoteDataSource: sl<HomeRemoteDataSource>(),
      localDataSource: sl<HomeLocalDataSource>(),
    ),
  );
}
