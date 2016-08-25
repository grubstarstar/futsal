module.exports = function (grunt) {
	grunt.initConfig({
		browserify: {
			dist: {
				options: {
					transform: [
						[
							'babelify',
							{ presets: [ 'es2015', 'react' ] }
						]
					],
			        browserifyOptions: {
			          paths: [
			            "node_modules"
			          ]
			        }
				},
				files: {
					"./public/bundle.js": ["./src/app.js"]
				}
			}
		},
		uglify: {
			my_target: {
				files: {
					"./public/bundle.min.js": ["./public/bundle.js"]
				}
			}
		},
		watch: {
			scripts: {
				files: ["./src/**/*.js", "./src/**/*.jsx"],
				tasks: ["browserify"]
			}
		}
	});

	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.registerTask("default", ["browserify", "watch"]);
	grunt.registerTask("build", ["browserify", "uglify"]);
};