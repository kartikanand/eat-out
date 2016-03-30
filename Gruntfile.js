module.exports = function (grunt) {

    // load all grunt tasks at once!
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        appDir: 'app/',
        viewsDir: '<%= appDir %>views/',
        staticDir: '<%= appDir %>static/',
        devDir: '<%= appDir %>dev/',
        prodDir: '<%= appDir %>public/',
        env: {
            dev: {
                NODE_ENV: 'development'
            },
            prod: {
                NODE_ENV: 'production'
            }
        },
        browserify: {
            options: {
                transform: [
                    [
                        'babelify', {
                            presets: ['babel-preset-es2015', 'babel-preset-react']
                        }
                    ],
                    ['envify']
                ]
            },
            dist: {
                files: {
                    '<%= devDir %>js/bundle.js': '<%= staticDir %>/js/script.es6'
                }
            },
        },
        sass: {
            dist: {
                files: {
                    '<%= devDir %>css/styles.css': '<%= staticDir %>css/styles.scss'
                }                
            }
        },
        cssmin: {
            css: {
                src: '<%= devDir %>css/styles.css',
                dest: '<%= prodDir %>css/styles.min.css'
            }
        },
        uglify: {
            js: {
                files: {
                    '<%= prodDir %>js/bundle.min.js': ['<%= devDir %>js/bundle.js']
                }    
            }
        },
        watch: {
            options: {
                livereload: true,
            },
            src: {
                files: ['<%= viewsDir %>index.jade'],
                tasks: [],
            },
            css: {
                files: ['<%= staticDir %>css/*.scss'],
                tasks: ['sass']
            },
            js: {
                files: [
                    '<%= staticDir %>js/**/*',
                ],
                tasks: ['browserify']
            },
            server: {
                files: ['.reboot'],
                tasks: []
            }
        },
        nodemon: {
            options: {
                callback: function (nodemon) {
                    nodemon.on('log', function (event) {
                        console.log(event.colour);
                    });

                    nodemon.on('config:update', function () {
                        setTimeout(function () {
                            require('open')('http://localhost:8080');
                        }, 2000);
                    });

                    nodemon.on('restart', function () {
                        setTimeout(function () {
                            require('fs').writeFileSync('.reboot', 'reboot');
                        }, 7000);
                    });
                }
            },
            des: {
                script: '<%= pkg.main %>',
                watch: ['<%= appDir %>'],
                // no need to do a whole server restart for below directories
                // a simple page refresh would do, using grunt-watch
                ignore: ['<%= staticDir %>', '<%= viewsDir %>', '<%= prodDir %>', '<%= devDir %>']
            }
        },
        concurrent: {
            target: {
                tasks: ['watch', 'nodemon'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        clean: {
            prod: ['<%= prodDir %>'],
            dev: ['<%= devDir %>']
        }
    });

    grunt.registerTask('default', ['env:dev', 'sass', 'browserify', 'concurrent']);
    grunt.registerTask('build', ['env:prod', 'sass', 'browserify', 'cssmin', 'uglify']);
};
