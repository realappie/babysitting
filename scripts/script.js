/**
 * babysitting Module
 *
 * Description
 */
app = angular.module('babysitting', ['ui.router', 'ngAnimate', 'ngMaterial', 'firebase', 'ngMessages', 'ngOrderObjectBy'])


app.factory('$toast', function() {
    return function(text) {
        document.getElementById("toast").className += "animate";
        document.querySelector('#toast span').innerHTML = text;
        setTimeout(
            function() {
                document.getElementById("toast").className = "";
            }, 3000);
    }
});
app.config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$httpProvider',
    function($stateProvider, $urlRouterProvider, $mdThemingProvider, $httpProvider) {
        //color config

        $mdThemingProvider.theme('default')
            .primaryPalette('indigo')
            .accentPalette('orange');        
        var host;
        if(window.location.hostname == "babysitting-3329b.firebaseapp.com"){
            host = "https://babysitting.herokuapp.com"
        } else{ host = "http://localhost:8080" }

        $httpProvider.interceptors.push(function() {
            return {
                'request': function(config) {
                    if (config.method == "POST" && config.api) {
                        config.url = host + config.url;
                    }
                    return config;
                }
            }
        })

        //Default route
        $urlRouterProvider.otherwise('/babysitters');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'pages/login.html',
                data: {
                    pageTitle: 'Login',
                    guests: true,
                    icon: "vpn_key"
                },
                controller: "mainCtrl"
            })
            .state('booking', {
                url: '/booking/{uid}',
                templateUrl: 'pages/booking.html',
                data: {
                    pageTitle: 'Booking',
                    guests: false,
                    hidden: true,
                    icon: "event_note"
                },
                controller: 'bookingCtrl'
            })
            .state('babysitters', {
                url: '/babysitters',
                templateUrl: 'pages/babysitters.html',
                data: {
                    pageTitle: 'babysitters',
                    guest: false,
                    icon: 'people',
                    parent: true
                },
                controller: 'babysittersCtrl'
            })
            .state('find', {
                url: '/find',
                templateUrl: 'pages/find.html',
                data: {
                    pageTitle: 'Find',
                    guest: false,
                    icon: 'search',
                    parent: true
                },
                controller: 'findCtrl'
            })
            .state('register', {
                //url: '/booking',
                url: '/register',
                templateUrl: 'pages/register.html',
                replace: true,
                data: {
                    pageTitle: 'Register',
                    guests: true,
                    icon: "create"
                },
                params: {
                    googleLogin: null
                },
                controller: 'registerCtrl'
            })
            .state('accountPage', {
                url: '/account/{tab}',
                templateUrl: 'pages/account.html',
                data: {
                    pageTitle: 'My Account',
                    guests: false,
                    icon: "perm_identity"
                },
                controller: 'accountCtrl'
            })
            .state('children', {
                url: '/children/{edit}',
                templateUrl: 'pages/children.html',
                data: {
                    pageTitle: 'My children',
                    hidden: true,
                    guests: false
                },
                controller: 'childrenCtrl'
            })
            .state('bookingDetails', {
                url: '/booking/info/{id}',
                templateUrl: 'pages/bookingDetails.html',
                data: {
                    pageTitle: 'Booking information',
                    hidden: true,
                    guests: false
                },
                controller: 'bookingDetails'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'pages/about.html',
                data: {
                    pageTitle: 'About',
                    guests: true,
                    icon: "info_outline"
                }
            })
    }
]);



app.run(['$rootScope', '$state', '$stateParams', '$firebaseObject', '$toast', '$firebaseAuth',
    function($rootScope, $state, $stateParams, $firebaseObject, $toast, $firebaseAuth) {
        $rootScope.$state = $state;
        $rootScope.states = $state.get();
        $rootScope.states.shift();
        $rootScope.availableStates = $rootScope.states;
        $rootScope.currentUserLoaded = false;
        $rootScope.loggedIn = false;
        $rootScope.authStateLoaded = false;
        $rootScope.authData = {};
        $rootScope.incompleteData = false;

        var config = {
            apiKey: "AIzaSyDL6RudaDzBsZmbPMGwfrpKiErSOqVJjQk",
            authDomain: "babysitting-3329b.firebaseapp.com",
            databaseURL: "https://babysitting-3329b.firebaseio.com",
            storageBucket: "babysitting-3329b.appspot.com",
        };
        firebase.initializeApp(config);

        $rootScope.authObj = $firebaseAuth();

        $rootScope.authObj.$onAuthStateChanged(function(user) {
            $rootScope.authStateLoaded = true;
            if (user) {
                $rootScope.loggedIn = true;
                $rootScope.authData = JSON.parse(JSON.stringify(user));
                console.log("auth data is");
                console.log($rootScope.authData);
                // if($rootScope.$state.current.name == "login"){ $state.go('babysitters') }
            } else {
                $rootScope.loggedIn = false;
                $state.go('login')
            }
        });

        /*if(!firebase.auth().currentUser){
            $rootScope.authStateLoaded = true;
        }*/

        // Default rates & groups
        $rootScope.defaultAgeGroups = [{
            codename: 'A',
            description: 'Age group 1 - 2',
            rate: 5
        }, {
            codename: 'B',
            description: 'Age group 2 - 5',
            rate: 5
        }, {
            codename: 'C',
            description: 'Age group 5 - 8',
            rate: 5
        }, {
            codename: 'D',
            description: 'Age group 8 - 12',
            rate: 5
        }, {
            codename: 'E',
            description: 'Age group 12 - 16',
            rate: 5
        }];

        $rootScope.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        // Default work hours
        $rootScope.defaultWorkHours = [];
        for (var i = 0; i < 7; i++) {
            // Start time 25200000 = 7 AM , end time 72000000 = 8 PM which equates to the default time
            $rootScope.defaultWorkHours.push({
                name: $rootScope.days[i],
                startTime: 25200000,
                endTime: 72000000
            })
        };


        $rootScope.database = firebase.database().ref();
        window['database'] = $rootScope.database;
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
            if ($rootScope.navOpen) {
                $rootScope.slideAway();
            }
            if (toState.name == 'booking' && !toParams.uid) {
                event.preventDefault();
                $toast('Please choose a babysitter first');
                $state.go('babysitters');
            }
            if (toState.name == 'login' && $rootScope.loggedIn && !toParams.googleLogin) {
                event.preventDefault();
                $state.go('babysitters');
            }
            if ($rootScope.authStateLoaded) {
                if (!toState.data.guests && !$rootScope.loggedIn) {
                    event.preventDefault();
                    $state.go('login');
                    $toast('Please Login First');
                }
            }  
            console.log('$rootScope.incompleteData ', $rootScope.incompleteData );
            if($rootScope.incompleteData && !toState.data.guests && toState !== "register"){
                event.preventDefault();
                $toast("Please finish registeration");
            }
            
        })


        //firebase.auth().currentUser ? 

        $rootScope.$watch('loggedIn', function() {

            if ($rootScope.loggedIn) {
                $rootScope.availableStates = $rootScope.states.filter(function(state) {
                    return !state.data.guests && !state.data.hidden;
                });
                $rootScope.fetchUserData(firebase.auth().currentUser.uid);
            } else {
                $rootScope.availableStates = $rootScope.states.filter(function(state) {
                    return state.data.guests
                });
            }
        });

        $rootScope.fetchUserData = function(uid) {
            $rootScope.currentUser = $firebaseObject($rootScope.database.child('users/' + uid));

            $rootScope.currentUser.$loaded()
                .then(function() {
                    $rootScope.currentUserLoaded = true;
                    if($rootScope.currentUser.$value === null){
                        $rootScope.incompleteData = true;
                        console.log("empty data");
                        $toast("Please finish registeration");
                        $state.go("register");
                    }                    
                })
            $rootScope.currentUser.$watch(function(){
                if($rootScope.currentUser.$value !== null) $rootScope.incompleteData = false;
            })    
        }


    }
]);