/**
 * Popup width control.
 *
 * A number plus a unit (vw / % / px), matching the shape of WordPress's own
 * width inputs. An empty value means "use the stylesheet default", which is
 * how every existing block keeps working unchanged.
 */

import { __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const UNITS = [
	{ value: 'vw', label: 'vw', default: 80 },
	{ value: '%', label: '%', default: 90 },
	{ value: 'px', label: 'px', default: 900 },
];

interface PopupWidthControlProps {
	value: string;
	onChange: ( next: string ) => void;
}

export const PopupWidthControl = ( { value, onChange }: PopupWidthControlProps ) => (
	<UnitControl
		__next40pxDefaultSize
		label={ __( 'Popup width', 'tubebay' ) }
		help={ __(
			'Leave empty for the default size. 100vw fills the screen edge to edge.',
			'tubebay'
		) }
		value={ value }
		units={ UNITS }
		min={ 0 }
		onChange={ ( next?: string ) => onChange( next || '' ) }
	/>
);
