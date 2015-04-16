require( "./helpers/node-setup.js" );

describe( "autohost-logging-collector - hypermedia requests", function() {
	var host, hyped, subscriber, fount, results, expected, actual;
	function initTest( cfg ) {
		host = require( "autohost" );
		hyped = require( "hyped" )();
		fount = require( "fount" );
		fount.register( "loggingCollectorConfig", cfg );
		fount.register( "postal", postal );
		var p = host.init( {
			fount: require( "fount" ),
			noOptions: true,
			urlStrategy: hyped.urlStrategy,
			port: 8898,
			modules: [
				"./src/index.js"
			]
		} ).then( hyped.addResources );
		hyped.setupMiddleware( host );
		subscriber = postal.subscribe( {
			channel: cfg.logChannel,
			topic: "#",
			callback: function( d, e ) {
				results.push( d );
			}
		} );
		return p;
	}

	before( function() {
		return initTest( {
			namespace: "test-namespace",
			logChannel: "test-channel"
		} );
	} );

	after( function() {
		host.stop();
		postal.reset();
	} );

	describe( "when making a successful request", function() {
		before( function() {
			expected = {
				status: 201,
				data: {
					_links: {
						"create": {
							method: "POST",
							href: "/api/logging/entry"
						}
					},
					_origin: {
						method: "POST",
						href: "/api/logging/entry"
					},
					_resource: "logging",
					_action: "create",
					msg: "Created"
				}
			};
			results = [];
			actual = undefined;
			return postLogEntry( {
				type: "info",
				level: 3,
				timestamp: "2015-03-19T13:26:34.000Z",
				msg: "For your information...."
			}, "application/hal+json" )
				.then( function( resp ) {
					actual = {
						status: resp[ 0 ].statusCode,
						data: resp[ 1 ]
					};
				} );
		} );
		it( "should publish log message", function() {
			results[ 0 ].should.eql( {
				msg: "For your information....",
				timestamp: "2015-03-19T13:26:34.000Z",
				utc: moment.utc( "2015-03-19T13:26:34.000Z" ),
				type: "info",
				level: 3,
				namespace: "test-namespace"
			} );
		} );
		it( "should return expected 201 response", function() {
			actual.should.eql( expected );
		} );
	} );
	describe( "when making a failing request", function() {
		before( function() {
			results = [];
			actual = undefined;
			return postLogEntry( {
				timestamp: "2015-03-19T13:26:34.000Z",
				msg: "For your information...."
			} ).then( function( resp ) {
				actual = {
					status: resp[ 0 ].statusCode,
					data: resp[ 1 ]
				};
			}, "application/hal+json" );
		} );
		it( "should NOT publish log message", function() {
			results.length.should.equal( 0 );
		} );
		it( "should return expected 400 response", function() {
			actual.status.should.equal( 400 );
			actual.data.msg.should.equal( "Logging payloads must contain timestamp, type, level and msg properties" );
		} );
	} );
} );
