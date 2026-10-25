import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../models/profile_entity.dart';

abstract class ProfileRepository {
  Future<Either<Failure, ProfileEntity>> getProfile();
}
