var chai = require( "chai" );
chai.use( require( "chai-as-promised" ) );
global.should = chai.should();
global.when = require( "when" );
global.postal = require( "postal" );
global.moment = require( "moment" );
var request = require( "request" );
var lift = require( "when/node" ).lift;
var post = lift( request.post ).bind( request );

global.postLogEntry = function postLogEntry( body, acceptHdr ) {
	return post( {
		url: "http://localhost:8898/api/logging/upload",
		headers: {
			"content-type": "application/json",
			accept: acceptHdr
		},
		json: body
	} );
};

var _log = console.log;
console.log = function() {
	if ( typeof arguments[ 0 ] === "string" && /^[a-zA-Z]/.test( arguments[ 0 ] ) ) {
		return; // swallow this message
	} else {
		_log.apply( console, arguments );
	}
};
