var _ = require( "lodash" );
var moment = require( "moment" );
module.exports = function( postal, loggingCollectorConfig ) {
	/*
		Log message structure on an individual log entry
		{
			type: "warn|error|info|debug",
			msg: "blah blah blah important stuff",
			timestamp: "Thu Mar 19 2015 13:26:34 GMT-0400 (EDT)",
			level: 2
		}
	*/

	function validateLogEntries( data ) {
		return _.reduce( data, function( acc, log ) {
			if ( log.timestamp && log.type && log.level && log.msg ) {
				log.utc = moment.utc( log.timestamp );
				log.namespace = log.namespace || loggingCollectorConfig.namespace;
				postal.publish( {
					channel: loggingCollectorConfig.logChannel,
					topic: log.type,
					data: log
				} );
				acc.processed++;
			} else {
				acc.invalid++;
			}
			return acc;
		}, { processed: 0, invalid: 0 } );
	}

	function process( data ) {
		if ( data && _.isArray( data ) ) {
			return {
				data: validateLogEntries( data ),
				status: 202
			};
		} else {
			return {
				data: {
					error: "Log Entries must be submitted as an array"
				},
				status: 400
			};
		}
	}

	return process;
};
