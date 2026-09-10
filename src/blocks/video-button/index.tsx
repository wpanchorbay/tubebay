/**
 * TubeBay Video Button block registration.
 */

import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import edit from './edit';
import save from './save';
import deprecated from './deprecated';
import { buttonBlockIcon } from '../shared/icons';

registerBlockType( metadata as any, {
	icon: buttonBlockIcon,
	edit,
	save,
	deprecated,
} );
