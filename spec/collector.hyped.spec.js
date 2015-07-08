require( "./helpers/node-setup.js" );

describe( "autohost-logging-collector - hypermedia requests", function() {
	var host, autohost, hyped, subscriber, fount, results, expected, actual;
	function initTest( cfg ) {
		autohost = require( "autohost" );
		hyped = require( "hyped" )();
		fount = require( "fount" );
		fount.register( "loggingCollectorConfig", cfg );
		fount.register( "postal", postal );
		host = hyped.createHost( autohost, {
			fount: fount,
			port: 8898,
			modules: [
				"./src/index.js"
			]
		} );
		host.start();
		subscriber = postal.subscribe( {
			channel: cfg.logChannel,
			topic: "#",
			callback: function( d, e ) {
				results.push( d );
			}
		} );
	}

	before( function() {
		initTest( {
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
				status: 202,
				data: {
					_links: {
						upload: {
							method: "POST",
							href: "/api/logging/upload"
						}
					},
					_origin: {
						method: "POST",
						href: "/api/logging/upload"
					},
					_resource: "logging",
					_action: "upload",
					processed: 1,
					invalid: 0
				}
			};
			results = [];
			actual = undefined;
			return postLogEntry( [
				{
					type: "info",
					level: 3,
					timestamp: "2015-03-19T13:26:34.000Z",
					msg: "For your information...."
				}
			], "application/hal+json" )
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
		it( "should return expected 202 response", function() {
			actual.should.eql( expected );
		} );
	} );
	describe( "when sending an invalid log entry", function() {
		before( function() {
			expected = {
				status: 202,
				data: {
					_links: {
						upload: {
							method: "POST",
							href: "/api/logging/upload"
						}
					},
					_origin: {
						method: "POST",
						href: "/api/logging/upload"
					},
					_resource: "logging",
					_action: "upload",
					processed: 0,
					invalid: 1
				}
			};
			results = [];
			actual = undefined;
			return postLogEntry( [
				{
					timestamp: "2015-03-19T13:26:34.000Z",
					msg: "For your information...."
				}
			], "application/hal+json" ).then( function( resp ) {
				actual = {
					status: resp[ 0 ].statusCode,
					data: resp[ 1 ]
				};
			} );
		} );
		it( "should NOT publish log message", function() {
			results.length.should.equal( 0 );
		} );
		it( "should return expected response", function() {
			actual.should.eql( expected );
		} );
	} );

	describe( "when sending an invalid request", function() {
		before( function() {
			expected = {
				status: 400,
				data: {
					_action: "upload",
					_links: {
						upload: {
							href: "/api/logging/upload",
							method: "POST"
						}
					},
					_origin: {
						href: "/api/logging/upload",
						method: "POST"
					},
					_resource: "logging",
					error: "Log Entries must be submitted as an array"
				}
			};
			results = [];
			actual = undefined;
			return postLogEntry( {
				timestamp: "2015-03-19T13:26:34.000Z",
				msg: "For your information...."
			}, "application/hal+json" ).then( function( resp ) {
				actual = {
					status: resp[ 0 ].statusCode,
					data: resp[ 1 ]
				};
			} );
		} );
		it( "should NOT publish log message", function() {
			results.length.should.equal( 0 );
		} );
		it( "should return expected 400 response", function() {
			actual.should.eql( expected );
		} );
	} );
} );
