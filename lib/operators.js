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



// To use with lerp as a transformation for T
exports['cos-t'] = ( t ) => 0.5 - 0.5 * Math.cos( t * Math.PI ) ;

