var moment = require( "moment" );

module.exports = function( host, postal, loggingCollectorConfig ) {

	function validatePayload( payload ) {
		if ( payload.timestamp && payload.type && payload.level && payload.msg ) {
			postal.publish( {
				channel: loggingCollectorConfig.logChannel,
				topic: payload.type,
				data: payload
			} );
			return {
				status: 201,
				data: { msg: "Created" }
			};
		} else {
			return {
				status: 400,
				data: { msg: "Logging payloads must contain timestamp, type, level and msg properties" }
			};
		}
	}

	return {
		name: "logging",
		actions: {
			create: {
				url: "/entry",
				method: "POST",
				/*
					Log message structure on body - while it *can* be manually constructed,
					ideally clients should use a client-side whistlepunk API to produce this.
					(NOTE: namespace will be overwritten to specify log originated from client)
					{
						type: "warn|error|info|debug",
						msg: "blah blah blah important stuff",
						timestamp: "Thu Mar 19 2015 13:26:34 GMT-0400 (EDT)",
						level: 2
					}
				*/
				handle: function( env ) {
					var payload = env.data;
					payload.utc = moment.utc( payload.timestamp );
					payload.namespace = payload.namespace || loggingCollectorConfig.namespace;
					var validated = validatePayload( env.data );
					if ( env.hyped ) {
						env.hyped( validated.data ).status( validated.status ).render();
					} else {
						env.reply( validated );
					}
				}
			}
		}
	};
};
