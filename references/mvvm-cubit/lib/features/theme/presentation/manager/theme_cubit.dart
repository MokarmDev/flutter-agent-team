import 'package:flutter_bloc/flutter_bloc.dart';

import '../../data/models/theme_entity.dart';
import '../../data/repositories/theme_repository.dart';
import 'theme_state.dart';

class ThemeCubit extends Cubit<ThemeState> {
  final ThemeRepository themeRepository;

  ThemeCubit(this.themeRepository) : super(ThemeInitial());

  Future<void> loadData() async {
    emit(ThemeLoading());
    try {
      final theme = await themeRepository.getTheme();
      emit(ThemeSuccess(theme));
    } catch (e) {
      emit(ThemeError(e.toString()));
    }
  }

  Future<void> toggleTheme() async {
    if (state is ThemeSuccess) {
      final currentThemeType = (state as ThemeSuccess).theme.type;
      final newThemeType = currentThemeType == ThemeType.light
          ? ThemeType.dark
          : ThemeType.light;

      final newTheme = ThemeEntity(type: newThemeType);

      try {
        await themeRepository.saveTheme(newTheme);
        emit(ThemeSuccess(newTheme));
      } catch (e) {
        emit(ThemeError(e.toString()));
      }
    }
  }
}
