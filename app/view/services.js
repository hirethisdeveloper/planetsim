view.factory('Services', ['$log', function ($log) {
    return {
        initData:              function () {
            return {
                inner:  {
                    status:   true,
                    color:    "#ecbc00",
                    diameter: 150,
                    rotation: {
                        degree:  0,
                        timeout: 50
                    }
                },
                orbits: []
            };
        },
        newOrbitConfig:        function () {
            return {
                visible:  false,
                status:   true,
                color:    "#3ea93c",
                rotation: {
                    degree: 0
                },
                orbit:    {
                    degree: 0
                }
            };
        },
        getRandom:             function (min, max) {
		min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
}]);
