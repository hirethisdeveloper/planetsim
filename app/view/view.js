'use strict';
var view = angular.module('myApp.view', ['ngRoute']);
view.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'view/view.html',
        controller:  'ViewController'
    });
}]);
view.controller('ViewController', ['$scope', 'SPECTRUM', 'Services', function ($scope, SPECTRUM, Services) {
    $scope.sidebarVisible      = true;
    $scope.loggingPanelVisible = true;
    $scope.loggingOutputArr    = [];
    $scope.logPrefix           = " -> ";

    // IMPORTED - color picker global options
    $scope.spectrum = SPECTRUM;

    $scope.animation = {
        factor: 0.5,
        config: {
            start: 0.5,
            range: {
                'min': 0.1,
                'max': 1.0
            }
        }
    };

    /**
     * Purpose: The primary data object for this controller.
     * @type {*|{inner, orbits}}
     */
    $scope.data = Services.initData();

    $scope.inner = {
        diameterConfig: {
            start: $scope.data.inner.diameter,
            step:  1,
            range: {
                'min': 50,
                'max': 175
            }
        },
        speedConfig:    {
            start:     $scope.data.inner.rotation.timeout,
            direction: 'rtl',
            step:      5,
            range:     {
                'min': 0,
                'max': 500
            }
        }
    };

    /**
     * SCOPE METHOD: addOrbit
     * Purpose: Adds an orbital object
     */
    $scope.addOrbit = function () {
        var newIdx              = $scope.data.orbits.length,
            newObj              = Services.newOrbitConfig();
        newObj.diameter         = Services.getRandom(20, 75);
        newObj.distance         = $scope.data.inner.diameter + newObj.diameter * newIdx;
        newObj.rotation.timeout = Services.getRandom(0, 50);
        newObj.orbit.timeout    = Services.getRandom(0, 50);

        newObj.configs = {
            diameterConfig: {
                start: newObj.diameter,
                step:  1,
                range: {
                    'min': 20,
                    'max': 75
                }
            },
            speedConfig:    {
                start:     newObj.rotation.timeout,
                direction: 'rtl',
                step:      1,
                range:     {
                    'min': 0,
                    'max': 50
                }
            },
            orbitConfig:    {
                start:     newObj.orbit.timeout,
                direction: 'rtl',
                step:      1,
                range:     {
                    'min': 0,
                    'max': 50
                }
            }
        };

        $scope.data.orbits.push(newObj);
        $scope.loggingOutputAdd("Orbital object added");
    };

    /**
     * SCOPE METHOD: deleteObject
     * Purpose: Delete an orbital object
     * @param idx
     */
    $scope.deleteObject = function (idx) {
        $scope.data.orbits.splice(idx, 1);
        $scope.loggingOutputAdd("Orbital object deleted");
    };

    /**
     * SCOPE METHOD: loggingOutputAdd
     * Purpose: Adds a new message with date/time stamp to the top of the output logger array
     * @param str
     */
    $scope.loggingOutputAdd = function (str) {
        var now = new Date();
        $scope.loggingOutputArr.unshift({
            dateObj: now.toISOString(),
            text:    $scope.logPrefix + str
        });
    };

    // INNER OBJECT CHANGE LISTENER
    var innerChange = $scope.$on("INNERCHANGE", function (e, args) {
        var c      = args.curval,
            p      = args.prevval,
            prefix = "Inner change - ";

        if (args.curval !== args.prevval) {
            if (c.advanced !== p.advanced && c.advanced) $scope.loggingOutputAdd(prefix + "Advanced changed to " + c.advanced);
            if (c.color !== p.color && c.color) $scope.loggingOutputAdd(prefix + "Color changed to " + c.color);
            if (c.status !== p.status && c.status) {
                if (c.status == true) $scope.loggingOutputAdd(prefix + "Play >");
                if (c.status == false) $scope.loggingOutputAdd(prefix + "Paused ||");
            }
            if (c.diameter !== p.diameter && c.diameter) $scope.loggingOutputAdd(prefix + "Diameter changed to " + c.diameter);
            if (c.rotation.timeout !== p.rotation.timeout && c.rotation.timeout) $scope.loggingOutputAdd(prefix + "Spin timeout changed to " + c.rotation.timeout);
        }

    });

    // ORBITAL OBJECTS CHANGE LISTENER
    var orbitalChange = $scope.$on("ORBITALCHANGE", function (e, args) {
        var c      = args.curval,
            p      = args.prevval,
            prefix = "Orbital #" + args.idx + " change - ";

        if (args.curval !== args.prevval) {
            if (c.advanced !== p.advanced && c.advanced) $scope.loggingOutputAdd(prefix + "Advanced changed to " + c.advanced);
            if (c.color !== p.color && c.color) $scope.loggingOutputAdd(prefix + "Color changed to " + c.color);
            if (c.status !== p.status && c.status) {
                if (c.status == true) $scope.loggingOutputAdd(prefix + "Play >");
                if (c.status == false) $scope.loggingOutputAdd(prefix + "Paused ||");
            }
            if (c.diameter !== p.diameter && c.diameter) $scope.loggingOutputAdd(prefix + "Diameter changed to " + c.diameter);
            if (c.rotation.timeout !== p.rotation.timeout && c.rotation.timeout) $scope.loggingOutputAdd(prefix + "Spin timeout changed to " + c.rotation.timeout);
        }
    });

    // On view change, clean up watchers
    $scope.$on("destroy", function () {
        innerChange();
        orbitalChange();
    });

    // Initialization method.
    var init = function () {
        $scope.loggingOutputAdd("app initialized");
        // init with one orbital object
        $scope.addOrbit();
    };

    // calling initialization
    init();
}]);
view.directive("inner", function ($log, $timeout) {
    return {
        restrict:   "E",
        replace:    true,
        scope:      {
            data: "="
        },
        template:   '<span class="inner">sun</span>',
        controller: function ($scope) {
            $scope.minDiameter = 50;
            $scope.maxDiameter = 175;
        },
        link:       function ($scope, element, attrs) {
            var timer;
            var init      = function (obj) {
                clearTimeout(timer);
                // obj.status controls the play/pause functionality
                if (obj.status) {
                    timer = setTimeout(function () {
                        $scope.rotate(obj);
                    }, obj.rotation.timeout);
                }
            };
            $scope.rotate = function (obj) {
                $scope.$apply(function () {
                    var rotation = obj.rotation.degree + $scope.$parent.animation.factor;
                    if (rotation < 0) rotation = 360;
                    else if (rotation > 360) rotation = 0;
                    obj.rotation.degree = rotation;
                    var rotationString  = "rotate(" + rotation + "deg)",
                        cssBlock        = {
                            "background-color":  obj.color,
                            "width":             obj.diameter,
                            "height":            obj.diameter,
                            //"border-radius":     obj.diameter * 0.33,
                            "box-shadow":        "0px 0px 60px 20px " + obj.color,
                            "-ms-transform":     rotationString,
                            "-webkit-transform": rotationString,
                            "transform":         rotationString,
                            "top":               ($(window).height() / 2) - (obj.diameter / 2),
                            "left":              ($(window).width() / 2) - (obj.diameter / 2) + ($(".sidebar").width() / 2)
                        };
                    element.css(cssBlock);
                    init(obj);
                })
            };
            $scope.$watch("data", function (curval, prevval) {
                if (curval) {
                    // rotation limits
                    if (curval.rotation.degree < 0) curval.rotation.degree = 360;
                    else if (curval.rotation.degree > 360) curval.rotation.degree = 0;
                    init(curval);
                    $scope.$emit("INNERCHANGE", {curval: curval, prevval: prevval});
                }
            }, true);
        }
    }
});
view.directive("orbit", function ($log) {
    return {
        restrict:   "E",
        replace:    true,
        scope:      {
            data: "=",
            idx:  "@"
        },
        template:   '<span class="orbit"><span class="orbitObject">{{objIdx}}</span></span>',
        controller: function ($scope) {
            $scope.minDiameter = 25;
            $scope.maxDiameter = 75;
            $scope.objIdx      = parseInt($scope.idx) + 1
        },
        link:       function ($scope, element, attrs) {
            var orbitObject     = element.find("span.orbitObject"),
                timerArray      = [],
                initOrbit       = function () {
                    if (timerArray[0]) clearTimeout(timerArray[0]);
                    // obj.status controls the play/pause functionality
                    if ($scope.data.status) {
                        timerArray[0] = setTimeout(function () {
                            $scope.revolve($scope.data);
                        }, $scope.data.orbit.timeout);
                    }
                },
                initOrbitObject = function () {
                    if (timerArray[1]) clearTimeout(timerArray[1]);
                    // obj.status controls the play/pause functionality
                    //if ($scope.data.status) {
                    timerArray[1] = setTimeout(function () {
                        $scope.rotate($scope.data);
                    }, $scope.data.rotation.timeout);
                    //}
                };
            $scope.revolve      = function () {
                $scope.$apply(function () {
                    var orbitDegree = $scope.data.orbit.degree + $scope.$parent.animation.factor;
                    if (orbitDegree < 0) orbitDegree = 360;
                    else if (orbitDegree > 360) orbitDegree = 0;
                    $scope.data.orbit.degree = orbitDegree;
                    if (!$scope.data.distance) $scope.data.distance = (parseInt($scope.$parent.data.inner.diameter) + parseInt($scope.data.distance));
                    var orbitString = "rotate(" + orbitDegree + "deg) translate( " + parseInt($scope.data.distance) + "px, 0px )";
                    var orbitCss    = {
                        "width":             parseInt($scope.data.distance),
                        "height":            parseInt($scope.data.distance),
                        //"border-radius":     parseInt($scope.data.distance) * 0.33,
                        "-ms-transform":     orbitString,
                        "-webkit-transform": orbitString,
                        "transform":         orbitString,
                        "top":               ($(window).height() / 2) - (parseInt($scope.data.distance) / 2),
                        "left":              ($(window).width() / 2) - (parseInt($scope.data.distance) / 2) + ($(".sidebar").width() / 2)
                    };
                    element.css(orbitCss);
                    initOrbit();
                })
            };
            $scope.rotate       = function () {
                $scope.$apply(function () {
                    var rotationDegree = $scope.data.rotation.degree + $scope.$parent.animation.factor;
                    if (rotationDegree < 0) rotationDegree = 360;
                    else if (rotationDegree > 360) rotationDegree = 0;
                    $scope.data.rotation.degree = rotationDegree;
                    if (!$scope.data.diameter) $scope.data.diameter = 20;
                    var rotationString = "rotate(" + rotationDegree + "deg)";
                    var orbitObjectCss = {
                        "background-color":  $scope.data.color,
                        "width":             $scope.data.diameter,
                        "height":            $scope.data.diameter,
                        //"border-radius":     $scope.data.diameter * 0.33,
                        "-ms-transform":     rotationString,
                        "-webkit-transform": rotationString,
                        "transform":         rotationString,
                        "top":               (element.height() / 2) - (parseInt($scope.data.diameter) / 2),
                        "left":              (element.width() / 2) - (parseInt($scope.data.diameter) / 2)
                    };
                    orbitObject.css(orbitObjectCss);
                    initOrbitObject();
                })
            };
            $scope.$watchCollection("data", function (curval, prevval) {
                if (curval) {
                    initOrbit();
                    initOrbitObject();
                    $scope.$emit("ORBITALCHANGE", {idx: $scope.idx, curval: curval, prevval: prevval});
                }
            });
        }
    }
});
view.directive("slider", function ($log, $timeout) {
    return {
        restrict:   "E",
        replace:    true,
        scope:      {
            config:    "=",
            elementId: "@",
            output:    "="
        },
        template:   '<div id="{{elementId}}"></div>',
        controller: function ($scope) {

        },
        link:       function ($scope, element, attrs) {
            $timeout(function () {
                $scope.$apply(function () {
                    var slider = angular.element("#" + $scope.elementId)[0];
                    noUiSlider.create(slider, $scope.config);
                    slider.noUiSlider.on('update', function () {
                        $scope.output = parseFloat(slider.noUiSlider.get());
                    });
                })
            }, 10);
        }
    }
});