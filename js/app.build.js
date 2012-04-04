({
    appDir: "../",
    baseUrl: "js",
    dir: "../../scplayer",
    optimize: "uglify",
    fileExclusionRegExp: /^\.|spec/,
    findNestedDependencies: true,
    paths: {
        'text':       'text',    
        'underscore': 'libs/underscore',
        'jquery':     'libs/jquery.1.7.1',
        'backbone':   'libs/backbone',
        'backboneLS': 'libs/backbone.localStorage',
        'mustache':   'libs/mustache'
    },
    modules: [
        {
            name: "script",
        }
    ]
})
