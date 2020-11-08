/*
	Spellcast - shared utilities

	Copyright (c) 2020 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



/*
	KFG Expression custom operators that are shared with the client:
	- operators that does not requires dependencies
	- operators useful for the client, like gfx parametric animations, so mostly simple math operators
*/



const getNamedParameters = require( 'kung-fig-expression/lib/getNamedParameters.js' ) ;
//const vanilla = require( 'kung-fig-expression/lib/fnOperators.js' ) ;



/*
	Rebased power

	syntax: base ^° exp [rebase]
	formula: rebase * ( base / rebase ) ^ exp
	rebase default value: 10
*/
exports['^°'] = ( base , exponent , rebase = 10 ) => rebase * Math.pow( base / rebase , exponent ) ;



// Return an array of dot coordinate, dot are spreaded around 0,0
// It uses the sunflower model, with r=sqrt(n) and a=goldenAngle*n
const GOLDEN_ANGLE = 2 * Math.PI * ( 1 - ( ( 1 + Math.sqrt( 5 ) ) / 2 - 1 ) ) ;
const SUNFLOWER_SPREAD_MAPPING = [ 'n' , 'distance' , 'x-offset' , 'y-offset' , 'order-by' , 'farthest-angle-deg' ] ;
exports['sunflower-spread'] = ( ... args ) => {
	var params = getNamedParameters( args , SUNFLOWER_SPREAD_MAPPING , {
		n: 0 ,
		distance: 1 ,
		'x-offset': 0 ,
		'y-offset': 0 ,
		'order-by': null
	} ) ;

	var r , angle , i , baseAngle ,
		output = [] ;

	if ( typeof params['farthest-angle-deg'] === 'number' ) {
		baseAngle = params['farthest-angle-deg'] * Math.PI / 180 - ( params.n - 1 ) * GOLDEN_ANGLE ;
	}
	else {
		baseAngle = Math.random() * 2 * Math.PI ;
	}

	r = params.distance ;
	output.push( {
		x: params['x-offset'] + r * Math.cos( baseAngle ) ,
		y: params['y-offset'] + r * Math.sin( baseAngle )
	} ) ;

	for ( i = 1 ; i < params.n ; i ++ ) {
		angle = baseAngle + i * GOLDEN_ANGLE ;
		r = params.distance * Math.sqrt( i ) ;
		output.push( {
			x: params['x-offset'] + r * Math.cos( angle ) ,
			y: params['y-offset'] + r * Math.sin( angle )
		} ) ;
	}

	if ( ! params['order-by'] ) { return output ; }

	var lastDot = output[ output.length - 1 ] ;

	switch ( params['order-by'] ) {
		case 'distance-from-farthest' :
			// Try to order dot with the dot closest to the last dot last
			lastDot.delta = 0 ;

			for ( i = output.length - 2 ; i >= 0 ; i -- ) {
				output[ i ].delta = Math.sqrt( ( output[ i ].x - lastDot.x ) ** 2 + ( output[ i ].y - lastDot.y ) ** 2 ) ;
			}

			output.sort( ( a , b ) => b.delta - a.delta ) ;
			break ;
	}

	return output ;
} ;



// Easing utilities

const HALF_PI = Math.PI / 2 ;

// Transform an ease-in into an ease-out, or an ease-out into an ease-in
function reciprocalEasingFn( t , fn ) {
	return 1 - fn( 1 - t ) ;
}

// Transform an ease-out into an ease-in-out, each one is in a quarter
function dualEasingFn( t , fn ) {
	return t < 0.5 ?
		( 1 - fn( 1 - 2 * t ) ) / 2 :
		( 1 + fn( 2 * t - 1 ) ) / 2 ;
}



// Easing functions

exports['ease-sine'] = exports['ease-in-out-sine'] = t => ( 1 - Math.cos( Math.PI * t ) ) / 2 ;
exports['ease-in-sine'] = t => 1 - Math.cos( HALF_PI * t ) ;
exports['ease-out-sine'] = t => Math.sin( HALF_PI * t ) ;

exports['ease-quadratic'] = exports['ease-in-quadratic'] = t => t * t ;
exports['ease-out-quadratic'] = t => 1 - ( 1 - t ) * ( 1 - t ) ;
exports['ease-in-out-quadratic'] = t => t < 0.5 ? 2 * t * t : 1 - 2 * ( 1 - t ) * ( 1 - t ) ;

exports['ease-cubic'] = exports['ease-in-cubic'] = t => t * t * t ;
exports['ease-out-cubic'] = t => 1 - ( 1 - t ) * ( 1 - t ) * ( 1 - t ) ;
exports['ease-in-out-cubic'] = t => t < 0.5 ? 4 * t * t * t : 1 - 4 * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) ;

exports['ease-quartic'] = exports['ease-in-quartic'] = t => t * t * t * t ;
exports['ease-out-quartic'] = t => 1 - ( 1 - t ) * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) ;
exports['ease-in-out-quartic'] = t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) ;

exports['ease-quintic'] = exports['ease-in-quintic'] = t => t * t * t * t * t ;
exports['ease-out-quintic'] = t => 1 - ( 1 - t ) * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) ;
exports['ease-in-out-quintic'] = t => t < 0.5 ? 16 * t * t * t * t * t : 1 - 16 * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) ;

exports['ease-in-circular'] = t => 1 - Math.sqrt( 1 - t * t ) ;
exports['ease-out-circular'] = t => Math.sqrt( 1 - ( 1 - t ) * ( 1 - t ) ) ;
exports['ease-in-out-circular'] = t => t < 0.5 ? 1 - Math.sqrt( 1 - 4 * t * t ) : -Math.sqrt( 1 - 4 * ( 1 - t ) * ( 1 - t ) ) ;

// From https://easings.net/
const EASE_BACK_C1 = 1.70158 ;
const EASE_BACK_C2 = EASE_BACK_C1 * 1.525 ;
const EASE_BACK_C3 = EASE_BACK_C1 + 1 ;
exports['ease-in-back'] = t => EASE_BACK_C3 * t * t * t - EASE_BACK_C1 * t * t ;
exports['ease-out-back'] = t => 1 - ( EASE_BACK_C3 * ( 1 - t ) * ( 1 - t ) * ( 1 - t ) - EASE_BACK_C1 * ( 1 - t ) * ( 1 - t ) ) ;
exports['ease-in-out-back'] = t => t < 0.5 ?
	2 * t * t * ( 2 * ( EASE_BACK_C2 + 1 ) * t - EASE_BACK_C2 ) :
	1 - 2 * ( 1 - t ) * ( 1 - t ) * ( 2 * ( EASE_BACK_C2 + 1 ) * ( 1 - t ) - EASE_BACK_C2 ) ;

// From https://easings.net/
const EASE_2_PI_BY_3 = ( 2 * Math.PI ) / 3 ;
const EASE_4_PI_BY_9 = ( 4 * Math.PI ) / 9 ;
exports['ease-in-elastic'] = t =>
	t <= 0 ? 0 :
	t >= 1 ? 1 :
	-Math.pow( 2 , 10 * t - 10 ) * Math.sin( ( t * 10 - 10.75 ) * EASE_2_PI_BY_3 ) ;
exports['ease-out-elastic'] = t =>
	t <= 0 ? 0 :
	t >= 1 ? 1 :
	Math.pow( 2 , -10 * t ) * Math.sin( ( t * 10 - 0.75 ) * EASE_2_PI_BY_3 ) + 1 ;
exports['ease-in-out-elastic'] = t =>
	t <= 0 ? 0 :
	t >= 1 ? 1 :
	t < 0.5 ? -( Math.pow( 2 , 20 * t - 10 ) * Math.sin( ( 20 * t - 11.125 ) * EASE_4_PI_BY_9 ) ) / 2 :
	( Math.pow( 2 , -20 * t + 10 ) * Math.sin( ( 20 * t - 11.125 ) * EASE_4_PI_BY_9 ) ) / 2 + 1 ;

const EASE_BOUNCE_N1 = 7.5625 ;
const EASE_BOUNCE_D1 = 2.75 ;
exports['ease-out-bounce'] = t =>
	t <= 0 ? 0 :
	t >= 1 ? 1 :
	t < 1 / EASE_BOUNCE_D1 ? EASE_BOUNCE_N1 * t * t :
	t < 2 / EASE_BOUNCE_D1 ? EASE_BOUNCE_N1 * ( t - 1.5 / EASE_BOUNCE_D1 ) * t - 0.75 :
	t < 2.5 / EASE_BOUNCE_D1 ? EASE_BOUNCE_N1 * ( t - 2.25 / EASE_BOUNCE_D1 ) * t - 1.3125 :
	EASE_BOUNCE_N1 * ( t - 2.625 / EASE_BOUNCE_D1 ) * t - 1.640625 ;
exports['ease-in-bounce'] = t => reciprocalEasingFn( t , exports['ease-out-bounce'] ) ;
exports['ease-in-out-bounce'] = t => dualEasingFn( t , exports['ease-out-bounce'] ) ;

exports['parametric-invert'] = t => 1 - t ;

// Going and coming
exports['parametric-round-trip'] = ( t , p1 = 0.5 ) =>
	t <= p1 ? t / p1 :
	1 / ( 1 - p1 ) - t / ( 1 - p1 ) ;

// Going and coming, handed down to a different easing function
exports['parametric-round-trip-switch'] = ( t , p1 = 0.5 , easing1 , easing2 ) => {
	var easing ;

	if ( t <= p1 ) {
		t = t / p1 ;
		easing = exports[ 'ease-' + easing1 ] ;
		return easing ? easing( t ) : t ;
	}

	t = 1 / ( 1 - p1 ) - t / ( 1 - p1 ) ;
	easing = exports[ 'ease-' + easing2 ] ;
	return easing ? 1 - easing( 1 - t ) : t ;
} ;

// Going and coming with a pause in between
const ONE_THIRD = 1 / 3 ;
exports['parametric-round-trip-with-pause'] = ( t , p1 = ONE_THIRD , p3 = ONE_THIRD ) =>
	t <= p1 ? t / p1 :
	t >= 1 - p3 ? 1 / p3 - t / p3 :
	1 ;

// Going and coming with a pause in between, handed down to a different easing function
exports['parametric-round-trip-with-pause-switch'] = ( t , p1 = ONE_THIRD , easing1 , p3 = ONE_THIRD , easing3 ) => {
	var easing ;

	if ( t <= p1 ) {
		t = t / p1 ;
		easing = exports[ 'ease-' + easing1 ] ;
		return easing ? easing( t ) : t ;
	}

	if ( t >= 1 - p3 ) {
		t = 1 / p3 - t / p3 ;
		easing = exports[ 'ease-' + easing3 ] ;
		return easing ? 1 - easing( 1 - t ) : t ;
	}

	return 1 ;
} ;



// The function itself should know its identifier
for ( let key in exports ) {
	if ( ! exports[ key ].id ) { exports[ key ].id = key ; }
}

