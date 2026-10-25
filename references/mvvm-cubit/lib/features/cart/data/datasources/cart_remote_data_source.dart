import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../models/cart_entity.dart';

abstract class CartRemoteDataSource {
  Future<Either<Failure, CartEntity>> fetchCart();
}

class CartRemoteDataSourceImpl implements CartRemoteDataSource {
  @override
  Future<Either<Failure, CartEntity>> fetchCart() async {
    // TODO: implement API call
    throw UnimplementedError();
  }
}
