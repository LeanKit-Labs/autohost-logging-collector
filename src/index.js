var processor;

module.exports = function( host, postal, loggingCollectorConfig ) {
	processor = require( "./processor.js" )( postal, loggingCollectorConfig );
	return {
		name: "logging",
		actions: {
			upload: {
				url: "/upload",
				method: "POST",
				handle: function( env ) {
					return processor( env.data );
				}
			}
		}
	};
};
