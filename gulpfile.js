var gulp = require( "gulp" );
var mocha = require( "gulp-mocha" );
var istanbul = require( "gulp-istanbul" );
var open = require( "open" ); //jshint ignore:line
var allSrcFiles = "./src/**/*.js";
var allTestFiles = "./spec/**/*.spec.js";
var gulpMocha = require( "gulp-spawn-mocha" );

function runMocha( singleRun, files ) {
	return gulp.src( files, { read: false } )
		.pipe( gulpMocha( {
			R: "spec",
			"r": [
				"./spec/helpers/node-setup.js"
			]
		} ) ).on( "error", function() {
		if ( singleRun ) {
			process.exit( 1 );
		}
	} );
}

gulp.task( "test", function() {
	return runMocha( true, allTestFiles );
} );

gulp.task( "watch", [ "test" ], function() {
	gulp.watch( [ allTestFiles, allSrcFiles ], [ "test" ] );
} );

gulp.task( "coverage", function( cb ) {
	gulp.src( [ allSrcFiles ] )
		.pipe( istanbul() ) // Covering files
		.pipe( istanbul.hookRequire() ) // Force `require` to return covered files
		.on( "finish", function() {
			gulp.src( [ "./spec/helpers/node-setup.js", allTestFiles ] )
				.pipe( mocha() )
				.pipe( istanbul.writeReports() )
				.on( "end", function() {
					process.exit();
				} );
		} );
} );
