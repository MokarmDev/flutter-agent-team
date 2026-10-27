import '../datasources/theme_local_data_source.dart';
import '../models/theme_entity.dart';
import 'theme_repository.dart';

class ThemeRepositoryImpl implements ThemeRepository {
  final ThemeLocalDataSource localDataSource;

  ThemeRepositoryImpl(this.localDataSource);

  @override
  Future<ThemeEntity> getTheme() async {
    return await localDataSource.getTheme();
  }

  @override
  Future saveTheme(ThemeEntity theme) async {
    await localDataSource.saveTheme(theme.type);
  }
}
