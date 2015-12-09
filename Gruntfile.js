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
                    'app/static/prod/js/bundle.js': 'app/static/dev/js/script.js'
                }
            }
        },
        sass: {
            dist: {
                files: {
                    'app/static/prod/css/styles.css': 'app/static/dev/css/styles.scss'
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
                files: ['app/static/dev/css/styles.scss'],
                tasks: ['sass']
            },
            js: {
                files: ['app/static/dev/js/script.js'],
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
                            require('open')('http://localhost:2000');
                    });

                    nodemon.on('restart', function () {
                        setTimeout(function () {
                            require('fs').writeFileSync('.reboot', 'reboot');
                        }, 1000);
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('default', ['concurrent']);
};
