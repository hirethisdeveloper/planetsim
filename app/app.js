'use strict';
// Declare app level module which depends on views, and components
angular.module('myApp', [
        'ngRoute',
        'ngSpectrum',
        'myApp.view'
    ])
    .config(['$routeProvider', '$logProvider', function ($routeProvider, $logProvider) {
        $routeProvider.otherwise({redirectTo: '/'});
        $logProvider.debugEnabled(false);
    }])
    .value("SPECTRUM", {
        "showInitial":     true,
        "allowEmpty":      false,
        "preferredFormat": "hex"
    });
