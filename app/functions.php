<?php
/**
 * Reusable functions.
 *
 * @since      1.0.0
 * @package    TubeBay
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}





if ( ! function_exists( 'tubebay_log' ) ) {
	/**
	 * Log messages to the debug log file.
	 *
	 * @param mixed  $message  The message to log.
	 * @param string $level    The log level (e.g., 'DEBUG', 'INFO', 'ERROR').
	 * @since 1.0.0
	 */
	function tubebay_log( $message, $level = 'INFO' ) {
		$enable_logging = TubeBay\Helper\Settings::get( 'debug_enableMode' );
		if ( ! $enable_logging && ( 'ERROR' !== $level && 'error' !== $level ) ) {
			return;
		}
		$upload_dir = wp_upload_dir();
		$log_dir    = $upload_dir['basedir'] . '/' . TUBEBAY_TEXT_DOMAIN . '-logs/';

		if ( ! is_dir( $log_dir ) ) {
			wp_mkdir_p( $log_dir );
		}

		$log_file = $log_dir . 'plugin-log-' . gmdate( 'Y-m-d' ) . '.log';

		$formatted_message = '';
		if ( is_array( $message ) || is_object( $message ) ) {
			$formatted_message = wp_json_encode( $message );
		} else {
			$formatted_message = $message;
		}

		// Redact secrets before writing to log file so tokens never reach the log.
		$formatted_message = tubebay_redact_secrets( $formatted_message );

		$log_level = is_string( $level ) ? strtoupper( $level ) : ( is_array( $level ) || is_object( $level ) ? print_r( $level, true ) : '' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
		$log_entry = sprintf(
			"[%s] [%s]: %s\n",
			current_time( 'mysql' ),
			$log_level,
			$formatted_message
		);
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $log_file, $log_entry, FILE_APPEND | LOCK_EX );
	}
}

if ( ! function_exists( 'tubebay_redact_secrets' ) ) {
	/**
	 * Redact secret-bearing values from a log message string.
	 *
	 * Masks values of sensitive keys in JSON blobs and URL query parameters,
	 * so OAuth tokens and API keys never reach the log file regardless of what
	 * a caller passes to tubebay_log().
	 *
	 * @since 1.0.4
	 * @param string $message The formatted log message.
	 * @return string The message with secrets replaced by [REDACTED].
	 */
	function tubebay_redact_secrets( $message ) {
		if ( ! is_string( $message ) || '' === $message ) {
			return $message;
		}

		// 1. JSON key-value pairs: "access_token":"ya29.xxx" → "access_token":"[REDACTED]"
		$message = preg_replace(
			'/"(access_token|refresh_token|api_key|secret|password|token)"\s*:\s*"[^"]*"/i',
			'"$1":"[REDACTED]"',
			$message
		);

		// 2. URL query params: key=AIzaXxx& → key=[REDACTED]&
		//    'key' is the YouTube API key param; 'access_token'/'refresh_token'/'api_key' are also matched.
		$message = preg_replace(
			'/(api_key|access_token|refresh_token|key|token)=([^&"\s]+)/i',
			'$1=[REDACTED]',
			$message
		);

		return $message;
	}
}


if ( ! function_exists( 'tubebay_get_value' ) ) {
	/**
	 * Safely retrieve a value from a nested array or object using dot notation.
	 * Returns default if key is missing OR if value is an empty string.
	 *
	 * @since 1.0.0
	 * @param array|object $target        The array or object to search.
	 * @param string|array $key           The key path (e.g., 'settings.color').
	 * @param mixed        $default_value The default value if key is not found.
	 * @return mixed
	 */
	function tubebay_get_value( $target, $key, $default_value = null ) {
		if ( is_null( $key ) || '' === trim( $key ) ) {
			return $target;
		}

		$keys = is_array( $key ) ? $key : explode( '.', $key );

		foreach ( $keys as $segment ) {
			if ( is_array( $target ) && isset( $target[ $segment ] ) ) {
				$target = $target[ $segment ];
			} elseif ( is_object( $target ) && isset( $target->{$segment} ) ) {
				$target = $target->{$segment};
			} else {
				return $default_value;
			}
		}

		if ( '' === $target ) {
			return $default_value;
		}

		return $target;
	}
}
