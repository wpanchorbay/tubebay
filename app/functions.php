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
			// Re-create the access guards if the directory was removed post-activation.
			tubebay_write_log_dir_guards( $log_dir );
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

if ( ! function_exists( 'tubebay_write_log_dir_guards' ) ) {
	/**
	 * Write the .htaccess + index.php access guards into the log directory.
	 *
	 * Shared by the activator and tubebay_log() so the guards are (re)created
	 * whenever the log directory is created, not only on plugin activation.
	 *
	 * @since 1.2.1
	 * @param string $log_dir Absolute path to the log directory (trailing slash).
	 * @return void
	 */
	function tubebay_write_log_dir_guards( $log_dir ) {
		$htaccess_file = $log_dir . '.htaccess';
		if ( ! file_exists( $htaccess_file ) ) {
			$htaccess_content = "# Protect log files from direct access\n<Files *.log>\n\t<IfModule mod_authz_core.c>\n\t\tRequire all denied\n\t</IfModule>\n\t<IfModule !mod_authz_core.c>\n\t\tOrder allow,deny\n\t\tDeny from all\n\t</IfModule>\n</Files>\n";
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $htaccess_file, $htaccess_content );
		}

		$index_file = $log_dir . 'index.php';
		if ( ! file_exists( $index_file ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $index_file, "<?php\n// Silence is golden.\n" );
		}
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

		/*
		 * Curated secret-key list. In the JSON branch the key name is anchored by
		 * quotes, so matching is exact (e.g. "key" matches but "channelId"/"pageToken"
		 * do not). This closes the two known bypasses: the YouTube 'key' param when it
		 * is JSON-encoded, and 'connection_string' (base64 JSON carrying a refresh token).
		 * NOTE: any NEW secret-bearing key must be added here.
		 */
		$secret_keys = 'access_token|refresh_token|api_key|client_secret|secret|password|connection_string|authorization|credentials?|token|key';

		// JSON key-value pairs, e.g. "access_token":"ya29.xxx" -> "access_token":"[REDACTED]".
		// Key is fully quote-anchored, so only exact secret key names match.
		$message = preg_replace(
			'/"(' . $secret_keys . ')"\s*:\s*"[^"]*"/i',
			'"$1":"[REDACTED]"',
			$message
		);

		// URL query params, e.g. key=AIzaXxx& -> key=[REDACTED]&.
		// 'key' is the YouTube API key param; the rest cover OAuth/connection secrets.
		$message = preg_replace(
			'/(' . $secret_keys . ')=([^&"\s]+)/i',
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
