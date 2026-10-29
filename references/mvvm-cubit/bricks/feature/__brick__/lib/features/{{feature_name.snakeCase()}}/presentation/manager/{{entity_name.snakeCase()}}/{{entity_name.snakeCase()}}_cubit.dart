import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../../shared/mixin/cancelable_safe_cubit_mixin.dart';
import '../../../data/repositories/{{feature_name.snakeCase()}}_repository.dart';
import '{{entity_name.snakeCase()}}_state.dart';

class {{entity_name.pascalCase()}}Cubit extends Cubit<{{entity_name.pascalCase()}}State>
    with CancelableSafeCubitMixin<{{entity_name.pascalCase()}}State> {
  final {{feature_name.pascalCase()}}Repository _repository;

  {{entity_name.pascalCase()}}Cubit(this._repository)
      : super({{entity_name.pascalCase()}}Initial());

  Future<void> loadData() async {
    safeEmit({{entity_name.pascalCase()}}Loading());

    final result = await runCancelable(
      _repository.get{{entity_name.pascalCase()}}s(),
    );

    if (result == null) return;

    result.fold(
      (failure) => safeEmit({{entity_name.pascalCase()}}Error(failure.message)),
      (items) => safeEmit({{entity_name.pascalCase()}}Loaded(items)),
    );
  }
}
