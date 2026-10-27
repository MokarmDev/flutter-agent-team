import '../../core/di/injection_container.dart';
import '../../core/storage/shared_prefs_service.dart';
import 'data/datasources/theme_local_data_source.dart';
import 'data/repositories/theme_repository.dart';
import 'data/repositories/theme_repository_impl.dart';
import 'presentation/manager/theme_cubit.dart';

void initTheme() {
  // Cubit
  sl.registerFactory(() => ThemeCubit(sl<ThemeRepository>()));

  // Repository
  sl.registerLazySingleton<ThemeRepository>(() => ThemeRepositoryImpl(sl()));

  // Data Sources
  sl.registerLazySingleton<ThemeLocalDataSource>(
    () => ThemeLocalDataSource(sl<SharedPreferencesService>()),
  );
}
