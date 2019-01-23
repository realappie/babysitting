app.controller('bookingCtrl', ['$scope', '$state', '$rootScope', '$toast', '$stateParams', '$mdDialog', '$firebaseObject', '$http',
    function($scope, $state, $rootScope, $toast, $stateParams, $mdDialog, $firebaseObject, $http) {
        // =============================================================================================
        // Date stuff
        // =============================================================================================
        $scope.today = moment();
        $scope.todayIndex = $scope.today.day();
        $scope.currentWeek = true;
        $scope.weekIndex = 0;
        $scope.weekStat = {
            startOfWeek: moment().startOf('week').format('D-M-Y'),
            endOfWeek: moment().endOf('week').format('D-M-Y')
        }
        
        $scope.dayObjects = [];
        console.log($scope.todayIndex);
        $scope.weekIsFree = false;
        $scope.startTime = null;
        $scope.endTime = null;
        $scope.selectedDay = null;
        $scope.duration = null;
        $scope.cost = 0;
        $scope.selectedChildren = null;
        $scope.bookingsLoaded = false;

        /*
            Fetch bookings for x week from the firebase database
            @params number ms - pass epoch time of any date of desired week in milliseconds 
        */
        $scope.fetchBookings = function(ms) {
            $scope.bookingsLoaded = false;
            var bookingsPath = $rootScope.database.child('availability/' + $stateParams.uid + "/" + moment(ms).startOf('week').valueOf());
            $scope.bookings = $firebaseObject(bookingsPath)
            $scope.bookings.$loaded(function() {
                $scope.bookingsLoaded = true;
            })
        }

        /*
          Update the date, mainly for viewing current week & date purposes
          @params {object} date - pass a moment object, can be any given date in a week.          
        */
        $scope.updateDate = function(date) {
            $scope.weekNumber = date.format("w");
            if ($scope.weekIndex != 0) {
                date.startOf('week');
            }
            $scope.dayOfMonth = date.format('D');
            $scope.month = date.format('MMM');
            $scope.dayOfWeek = date.format('dddd');
            $scope.fetchBookings(date.valueOf());
        }

        $scope.updateDate($scope.today);



        /*
          Creates objects for x week, useful for navigating through weeks
          @params {object} date - pass a moment object, can be any given date in a week.          
        */
        //console.log(`date is ${date} and type is ${typeof date}`);
        $scope.createDays = function(date) {
            $scope.updateDate(date);
            for (var i = 0; i < 7; i++) {
                day = date.startOf('week').add(i, 'days');
                $scope.dayObjects[i] = {
                    "dayOfWeek": day.format('dddd'),
                    "moment": angular.copy(day),
                    "ms": day.valueOf(),
                    "date": day.format('D/MM')
                };
            }
        }

        $scope.createDays(moment());

        console.log($scope.dayObjects);

        $scope.$watch('weekIndex', function() {
            if ($scope.weekIndex == 0) {
                $scope.currentWeek = true;
            }
        });

        $scope.nextWeek = function() {
            // You can view 8 weeks this way, week with index of 7 will view you everything from
            // The start of week 7 till the end of it.
            if ($scope.weekIndex > 6) {
                $scope.maxHistory = true;
                return;
            }
            $scope.currentWeek = false;
            $scope.weekIndex += 1;

            $scope.createDays(moment().add($scope.weekIndex, 'weeks'));
        }

        $scope.previousWeek = function() {
            if ($scope.weekIndex == 0) {
                $scope.currentWeek = true;
                return;
            }
            $scope.maxHistory = false;
            // This will check which week is currently being viewed
            $scope.currentTime = moment().add($scope.weekIndex, 'w');
            // Will update the week index 
            $scope.weekIndex -= 1;
            // Takes the currently viewed week and goes back one week
            var difference = moment($scope.currentTime).subtract(1, 'w');
            // Generates the proper days for the week we want to go back to 
            $scope.createDays(difference);
            //console.log(`Current time is ${$scope.currentTime} and Weekindex is ${$scope.weekIndex}`);
        }

        //console.log($scope.todayIndex , today.format('D-M-Y'));
        /*yesterday = moment().day()
        Will return the index of the week with Sunday as 0 and Saturday as 6
    
        for creating past days in CURRENT week
        Just create moment objects for every single day.
        You check which day it is today, if its 3, you create a for loop 
        that creates 3 objects and increments a day everytime, you push every
        object in a 'past array'
        
        you also have to create todays object and the upcoming days in that week.

        for moving checking next weeks, you just create 7 new objects
        how you will do that is currently unknown
        */

        // =============================================================================================

        console.clear();
        var babysitter = $rootScope.database.child('babysitters/' + $stateParams.uid);
        $scope.babysitter = $firebaseObject(babysitter);
        console.log($scope.babysitter);

        $scope.babysitter.$loaded(function() {
            console.log($scope.babysitter.workHours[0]);
        })

        $scope.updateAges = function() {
            for (var i = 0; i < $scope.children.length; i++) {
                var date = moment(new Date($scope.children[i].birthday));
                var age = moment(date).fromNow(true);
                $scope.children[i].age = age;
            }
        }

        $scope.book = function(time, event) {
            $scope.selectedDay = moment(time).format("MMMM D");
            $scope.createTimes(time);
            console.log(time);
            $mdDialog.show({
                contentElement: '#bookDialog',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: true
            });
        };

        /*
          Create an array of objects for the dropdown
          @params number - pass unix timestamp in seconds of the day you want to generate times for
        */
        $scope.createTimes = function(day) {
            $scope.day = day;
            $scope.times = [];
            for (var i = 0; i <= 48; i++) {
                var time = {
                        "ms": moment(day).startOf('day').add(30 * i, 'm').valueOf(),
                        "format": moment(day).startOf('day').add(30 * i, 'm').format("hh:mm A"),
                        "moment": moment(day).startOf('day').add(30 * i, 'm').format("hh:mm A")
                    }
                    // This will disable already reserved days
                for (key in $scope.bookings[day]) {
                    if (time.ms >= $scope.bookings[day][key].startTime && time.ms <= $scope.bookings[day][key].endTime) {
                        time['unavailable'] = true;
                    }
                }
                //ms passed in that day for this time slot, useful to compare against busy hours
                var msDay = time.ms - moment(day).startOf('day').valueOf();
                // Index of day in week
                var index = moment(day).day();

                if (msDay < $scope.babysitter.workHours[index].startTime || msDay > $scope.babysitter.workHours[index].endTime) {
                    time['unavailable'] = true;
                }

                $scope.times.push(time);
            }
            console.log($scope.times);
        }

        $scope.calcDuration = function() {
            if ($scope.endTime == null || $scope.startTime == null) {
                return;
            }
            var momentDuration = moment.duration($scope.endTime.ms - $scope.startTime.ms);
            var hours = momentDuration.get('hours');
            var minutes = momentDuration.get('minutes');
            // Longer than an hour
            if (hours >= 1) {
                if (minutes > 0) {
                    if (hours == 1) {
                        $scope.duration = hours + " hour and " + minutes + " minutes";
                    } else {
                        $scope.duration = hours + " hours and " + minutes + " minutes";
                    }
                } else {
                    if (hours == 1) {
                        $scope.duration = hours + " hour";
                    } else {
                        $scope.duration = hours + " hours";
                    }
                }
            } else {
                $scope.duration = minutes + " minutes";
            }
            console.log($scope.duration);
            $scope.calcCost();
        }


        $scope.calcCost = function() {
            if ($scope.selectedChildren == null) {
                return;
            }
            $scope.cost = 0;
            // Determine in which age group each child falls
            for (var i = 0; i < $scope.selectedChildren.length; i++) {
                var age = moment().diff(moment($scope.selectedChildren[i].birthday), 'years');
                switch (true) {
                    case (age > 0 && age < 3):
                        //Childs age 1 to 2 = a
                        $scope.cost += $scope.babysitter.pricing[0].rate
                        break;
                    case (age > 1 && age < 6):
                        //Childs age 2 to 5 = b
                        $scope.cost += $scope.babysitter.pricing[1].rate
                        break;
                    case (age > 4 && age < 9):
                        //Childs age 5 to 8 = c
                        $scope.cost += $scope.babysitter.pricing[2].rate
                        break;
                    case (age > 7 && age < 13):
                        //Childs age 8 to 12 = d
                        $scope.cost += $scope.babysitter.pricing[3].rate
                        break;
                    case (age > 12):
                        //Childs age 12 + = e
                        $scope.cost += $scope.babysitter.pricing[4].rate
                        break;
                }
            }
            // At this point, we know how much the booking would cost if it would be an hour,
            // $scope.cost = total of the booking if it would be one hour
            $scope.cost = ($scope.cost * ($scope.endTime.ms - $scope.startTime.ms)) / 3600000;
            $scope.babysitter.pricing;
        }



        $scope.closeDialog = function() {
            $mdDialog.hide()
                .then(function() {
                    $scope.startTime = null;
                    $scope.endTime = null;
                    $scope.duration = null;
                    $scope.cost = 0;
                    $scope.selectedChildren = null;
                })
        }

        $scope.confirmBooking = function() {
            // // Testing

            // // Week of booking in MS, for showing the bookings later in the UI
            // var weekMS = moment($scope.startTime.ms).startOf('week').valueOf();
            // //Day of booking in MS, for showing the booking later in the ui as well
            // var dayMS = moment($scope.startTime.ms).startOf('day').valueOf();

            // $rootScope.database.child('availability/' + $stateParams.uid + '/' + weekMS + '/' + dayMS)
            //     .push({
            //         "startTime": $scope.startTime.ms,
            //         "endTime": $scope.endTime.ms
            //     })
            //     .then(function(data) {
            //         console.log('push successfull');
            //         console.log(data);
            //     }).catch(function(err) {
            //         console.error(err);
            //     })


            // return;
            // // Testing end

            $http({
                method: 'POST',
                url: '/booking/create',
                api: true,
                data: {
                    startTime: $scope.startTime.ms,
                    endTime: $scope.endTime.ms,
                    day: $scope.day,
                    parent: {
                        id: $scope.currentUser.$id,
                        street: $scope.currentUser.street,
                        zipcode: $scope.currentUser.zipCode,
                        children: $scope.selectedChildren,
                        email: $scope.currentUser.email,
                        name: $scope.currentUser.name
                    },
                    babysitter: {
                        id: $stateParams.uid,
                        email: $scope.babysitter.email,
                        name: $scope.babysitter.name
                    }
                }
            }).then(function(data) {
                console.log(data);
                $toast('Booking successful');
                $scope.closeDialog();
            }).catch(function(err) {
                $scope.closeDialog();
                $toast('Server error');
                console.error(err);
            });
        }

    }
])