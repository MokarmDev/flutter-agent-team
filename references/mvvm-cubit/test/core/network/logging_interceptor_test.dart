import 'package:flutter_mvvm_template/core/network/interceptors/api_interceptors.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('redacts sensitive headers regardless of case', () {
    final redacted = LoggingInterceptor.redactHeaders({
      'Authorization': 'Bearer abc',
      'cookie': 'session=1',
      'X-Api-Key': 'k',
      'Accept': 'application/json',
    });
    expect(redacted['Authorization'], '<redacted>');
    expect(redacted['cookie'], '<redacted>');
    expect(redacted['X-Api-Key'], '<redacted>');
    expect(redacted['Accept'], 'application/json');
  });

  test('auth paths are treated as sensitive', () {
    expect(LoggingInterceptor.isSensitivePath('/auth/login'), isTrue);
    expect(LoggingInterceptor.isSensitivePath('/oauth/token'), isTrue);
    expect(LoggingInterceptor.isSensitivePath('/products'), isFalse);
  });
}
