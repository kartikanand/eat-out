module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            options: {
                transform: [['babelify', {
                    presets: ['babel-preset-react']
                }]]
            },
            dist: {
                files: {
                    'app/static/js/bundle.js': 'app/static/js/script.js'
                }
            }
        },
        sass: {
            dist: {
                files: {
                    'app/static/css/styles.css': 'app/static/css/styles.scss'
                }                
            }
        },
        cssmin: {
            css: {
                src: 'app/static/css/styles.css',
                dest: 'app/public/css/styles.min.css'
            }
        },
        uglify: {
            js: {
                files: {
                    'app/public/js/bundle.min.js': ['app/static/js/bundle.js']
                }    
            }
        },
        watch: {
            options: {
                livereload: true,
            },
            src: {
                files: ['app/views/index.jade'],
                tasks: [],
            },
            css: {
                files: ['app/static/css/*.scss'],
                tasks: ['sass']
            },
            js: {
                files: ['app/static/js/script.js'],
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
                            require('open')('http://localhost:2000');
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
                script: 'app/app.js',
                watch: ['app'],
                ignore: ['app/static', 'app/views']
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
        mkdir: {
            prod: {
                options: {
                    create: ['app/public']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['concurrent']);

    grunt.registerTask('build', ['sass', 'browserify', 'mkdir', 'cssmin', 'uglify']);
};
