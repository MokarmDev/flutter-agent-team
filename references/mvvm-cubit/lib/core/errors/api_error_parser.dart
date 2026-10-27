/// Extracts user-facing messages and field errors from API error bodies.
///
/// Supports common shapes, including Laravel's:
/// `{"message": "...", "errors": {"email": ["..."]}}`.
class ApiErrorParser {
  static const fallbackMessage = 'An error occurred. Please try again.';

  static String parseMessage(dynamic response) {
    if (response == null) return fallbackMessage;

    if (response is String && response.isNotEmpty && response.length < 300) {
      return response;
    }

    if (response is! Map) return fallbackMessage;

    final map = Map<String, dynamic>.from(response);

    final error = map['error'];
    if (error is Map) {
      final message = error['message'] ?? error['Message'];
      if (message is String && message.isNotEmpty) return message;
    }
    if (error is String && error.isNotEmpty) return error;

    final data = map['data'];
    if (data is Map) {
      final dataMessage = data['message'] ?? data['Message'];
      if (dataMessage is String && dataMessage.isNotEmpty) return dataMessage;
    }

    final topMessage = map['message'] ?? map['Message'];
    if (topMessage is String && topMessage.isNotEmpty) return topMessage;

    return fallbackMessage;
  }

  /// Returns field errors as `field -> messages`, or an empty map.
  static Map<String, List<String>> parseFieldErrors(dynamic response) {
    if (response is! Map) return const {};
    final errors = response['errors'] ??
        (response['error'] is Map ? (response['error'] as Map)['errors'] : null);
    if (errors is! Map) return const {};

    final result = <String, List<String>>{};
    errors.forEach((key, value) {
      if (value is List) {
        final messages = value.whereType<String>().toList();
        if (messages.isNotEmpty) result['$key'] = messages;
      } else if (value is String && value.isNotEmpty) {
        result['$key'] = [value];
      }
    });
    return result;
  }
}
