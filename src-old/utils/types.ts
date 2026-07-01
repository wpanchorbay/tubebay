/**
 * Type definitions for the TubeBay plugin.
 *
 * Customize these types for your own plugin's data structures.
 */

export interface PluginData {
    plugin_name: string;
    short_name: string;
    menu_label: string;
    custom_icon: string;
    menu_icon: string;
    author_name: string;
    author_uri: string;
    support_uri: string;
    docs_uri: string;
    position: number;
}

export interface WpSettings {
    dateFormat: string;
    timeFormat: string;
}

/**
 * Plugin settings as stored in the WordPress option.
 * Must match the PHP default settings in Common.php.
 */
export interface PluginSettings {
    global_enableFeature: boolean;
    global_exampleText: string;
    advanced_deleteAllOnUninstall: boolean;
    debug_enableMode: boolean;
    api_key: string;
    channel_id: string;
    channel_name: string;
    thumbnails_default: string;
    thumbnails_medium: string;
    connection_status: string;
    auto_sync: boolean;
    last_sync_time: number;
    video_placement: string;
    cache_duration: number;
    muted_autoplay: boolean;
    show_controls: boolean;
    is_onboarding_completed: boolean;
    connection_method: "oauth" | "api";
    refresh_token: string;
}

export interface SyncPlacementSettings {
    auto_sync: boolean;
    video_placement: string;
    cache_duration: number;
    debug_enableMode: boolean;
    muted_autoplay: boolean;
    show_controls: boolean;
    advanced_deleteAllOnUninstall: boolean;
}

/**
 * The main store type, matching the data passed by PHP's wp_localize_script().
 */
export interface BoilerplateStore {
    version: string;
    root_id: string;
    nonce: string;
    store: string;
    rest_url: string;
    pluginData: PluginData;
    wpSettings: WpSettings;
    plugin_settings: PluginSettings;
    products_url: string;
}
