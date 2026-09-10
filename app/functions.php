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
		} elseif ( ! get_option( 'tubebay_logs_secured' ) ) {
			/*
			 * An install that already has a log directory never reaches the
			 * branch above, so its existing guessable-named files would keep
			 * their old names forever. Do the one-off rename here instead.
			 * The option makes this a single glob per site, not per write.
			 */
			tubebay_secure_legacy_log_files( $log_dir );
			tubebay_write_log_dir_guards( $log_dir );
			update_option( 'tubebay_logs_secured', 1, false );
		}

		$log_file = $log_dir . 'plugin-log-' . gmdate( 'Y-m-d' ) . '-' . tubebay_log_file_secret() . TUBEBAY_LOG_EXTENSION;

		// A fresh file starts with the guard, never with a log line.
		if ( ! file_exists( $log_file ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $log_file, TUBEBAY_LOG_GUARD, LOCK_EX );
		}

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

/*
 * Log files are written as .log.php, opening with `<?php exit;`.
 *
 * The unguessable filename below keeps the URL from being derived, but a name
 * that leaks any other way (a backup listing, a stray screenshot) would still
 * hand over the whole file. PHP is what makes the file unreadable rather than
 * merely unfindable: requested directly it executes, exits, and returns an
 * empty body — on nginx, Apache, IIS or anything else, with no dependence on
 * .htaccess, which nginx ignores outright.
 *
 * Nothing reads these files back through PHP — LogController exposes DELETE
 * only, and the guard is one line to skip when reading by hand.
 */
tubebay_define_log_constants();

/**
 * Define the log file constants once.
 *
 * @since  1.3.0
 * @return void
 */
function tubebay_define_log_constants() {
	if ( ! defined( 'TUBEBAY_LOG_EXTENSION' ) ) {
		define( 'TUBEBAY_LOG_EXTENSION', '.log.php' );
	}

	if ( ! defined( 'TUBEBAY_LOG_GUARD' ) ) {
		define( 'TUBEBAY_LOG_GUARD', "<?php exit; // phpcs:ignore ?>\n" );
	}
}

if ( ! function_exists( 'tubebay_protected_option_names' ) ) {
	/**
	 * Option names a full data wipe must leave alone.
	 *
	 * Every TubeBay option shares the `tubebay_` prefix, add-ons included, so
	 * a blanket `LIKE 'tubebay_%'` delete also takes `tubebay_license_key` and
	 * `tubebay_license_status` with it. Both wipe paths did exactly that: the
	 * free plugin's "Delete All Data" button and its uninstall routine each
	 * silently deactivated a PAID licence belonging to an add-on that was
	 * still installed and running, with nothing in the confirmation dialog
	 * saying so.
	 *
	 * An add-on cleans up after itself in its own uninstall, so free steps
	 * around anything an active add-on claims here.
	 *
	 * uninstall.php carries its own copy of this: WordPress loads that file
	 * standalone, without bootstrapping the plugin, so it cannot call this one.
	 * Keep the two in step.
	 *
	 * @since  1.3.0
	 * @return string[] Fully-prefixed option names to preserve.
	 */
	function tubebay_protected_option_names() {
		$protected = array();

		// Defined only while the pro add-on is active — i.e. exactly when
		// there is still a licence worth protecting.
		if ( defined( 'TUBEBAY_PRO_VERSION' ) ) {
			$protected = array(
				'tubebay_license_key',
				'tubebay_license_status',
			);
		}

		/**
		 * Filter the options a TubeBay data wipe must not delete.
		 *
		 * @since 1.3.0
		 * @param string[] $protected Fully-prefixed option names.
		 */
		$protected = apply_filters( 'tubebay_uninstall_protected_options', $protected );

		return array_values( array_unique( array_filter( array_map( 'strval', (array) $protected ) ) ) );
	}
}

if ( ! function_exists( 'tubebay_log_file_secret' ) ) {
	/**
	 * Per-site random suffix for log filenames.
	 *
	 * The log directory lives under wp-content/uploads, which is served
	 * directly by the web server. The .htaccess guard beside it is honoured by
	 * Apache and ignored completely by nginx, so on an nginx host the log was
	 * fetchable by anyone who guessed the name — and the name was
	 * `plugin-log-<today>.log`, which is not a guess so much as a calculation.
	 * Verified against a live install: HTTP 200, full contents, no auth.
	 *
	 * tubebay_redact_secrets() keeps tokens out of the file, so this is
	 * site-internals disclosure rather than a credential leak, but neither
	 * belongs on the open web. An unguessable suffix is the same defence
	 * WooCommerce applies to its own logs, and unlike a rewrite rule it does
	 * not depend on which web server is in front of WordPress.
	 *
	 * @since  1.3.0
	 * @return string 32 alphanumeric characters.
	 */
	function tubebay_log_file_secret() {
		$secret = get_option( 'tubebay_log_secret' );

		if ( ! is_string( $secret ) || 32 !== strlen( $secret ) ) {
			/*
			 * wp_generate_password() is pluggable, and pluggable.php loads
			 * after the plugin files themselves are included. Error-level
			 * logging is exactly the path that can run early and unexpectedly,
			 * and a fatal inside the logger would bury whatever it was trying
			 * to record — so fall back rather than assume.
			 */
			// bin2hex( random_bytes( 16 ) ) is exactly 32 hex characters.
			$secret = function_exists( 'wp_generate_password' )
				? wp_generate_password( 32, false, false )
				: bin2hex( random_bytes( 16 ) );

			update_option( 'tubebay_log_secret', $secret, false );
		}

		return $secret;
	}
}

if ( ! function_exists( 'tubebay_secure_legacy_log_files' ) ) {
	/**
	 * Rename log files written before the suffix existed.
	 *
	 * Without this, adding the suffix protects only new logs: every file
	 * already on disk keeps its guessable name and stays readable over HTTP.
	 *
	 * @since  1.3.0
	 * @param  string $log_dir Absolute path to the log directory, trailing slash.
	 * @return void
	 */
	function tubebay_secure_legacy_log_files( $log_dir ) {
		// Every plain .log file, whether or not it already carries a secret.
		$legacy = glob( $log_dir . 'plugin-log-*.log' );

		if ( empty( $legacy ) ) {
			return;
		}

		$secret = tubebay_log_file_secret();

		foreach ( $legacy as $file ) {
			$base = basename( $file, '.log' );

			// Add the secret only if this file predates it. A name already
			// ending in `-<32 chars>` has one.
			if ( ! preg_match( '/-[A-Za-z0-9]{32}$/', $base ) ) {
				$base .= '-' . $secret;
			}

			$target = $log_dir . $base . TUBEBAY_LOG_EXTENSION;

			// A log we cannot read is one we also could not have written, so
			// there is nothing useful to do about the failure here.
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_writable
			if ( file_exists( $target ) || ! is_writable( $file ) ) {
				continue;
			}

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$contents = file_get_contents( $file );

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			if ( false !== file_put_contents( $target, TUBEBAY_LOG_GUARD . $contents, LOCK_EX ) ) {
				wp_delete_file( $file );
			}
		}
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

		// IIS honours neither .htaccess nor nginx config.
		$web_config = $log_dir . 'web.config';
		if ( ! file_exists( $web_config ) ) {
			$web_config_content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<configuration>\n\t<system.webServer>\n\t\t<authorization>\n\t\t\t<deny users=\"*\" />\n\t\t</authorization>\n\t</system.webServer>\n</configuration>\n";
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $web_config, $web_config_content );
		}

		tubebay_secure_legacy_log_files( $log_dir );

		update_option( 'tubebay_logs_secured', 1, false );
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
