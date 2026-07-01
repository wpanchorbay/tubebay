<?php
/**
 * API Configuration
 *
 * Use this file to register your API controllers.
 * Each controller must extend TubeBay\Api\ApiController
 * and implement get_instance() and run().
 *
 * @package    TubeBay
 * @since 1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use TubeBay\Api\LogController;
use TubeBay\Api\ProductController;

return array(
	\TubeBay\Api\SettingsController::class,
	\TubeBay\Api\YouTubeController::class,
	ProductController::class,
	LogController::class,
);
