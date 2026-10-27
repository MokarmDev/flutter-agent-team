import '../../core/di/injection_container.dart';
import 'data/datasources/profile_remote_data_source.dart';
import 'data/repositories/profile_repository.dart';
import 'data/repositories/profile_repository_impl.dart';
import 'presentation/manager/profile_cubit.dart';

void initProfile() {
  // State Management
  sl.registerFactory(() => ProfileCubit());

  // Repository
  sl.registerLazySingleton<ProfileRepository>(
    () => ProfileRepositoryImpl(sl()),
  );

  // Data Sources
  sl.registerLazySingleton<ProfileRemoteDataSource>(
    () => ProfileRemoteDataSourceImpl(),
  );
}
