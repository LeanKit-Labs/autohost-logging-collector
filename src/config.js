module.exports = {
	registerDependencies: function( fount, postal, config ) {
		fount.register( "postal", postal );
		fount.register( "loggingCollectorConfig", config );
	}
};
