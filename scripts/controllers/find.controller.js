app.controller('findCtrl', ['$scope', '$state', '$rootScope', '$toast', '$firebaseObject', '$mdDialog', '$http',
    function($scope, $state, $rootScope, $toast, $firebaseObject, $mdDialog, $http) {
        $scope.date = null;
        $scope.today = new Date();
        // Max of bookings up to 8 weeks
        $scope.maxDate = moment().add(8, 'weeks').toDate();
        $scope.endTime = null;
        $scope.startTime = null;
        $scope.selectedChildren = {};
        $scope.matches = [];
        $scope.hideForm = false;
        $scope.zeroChildren = true;

        $rootScope.database.child('company/phoneNumber').once("value")
        .then(function(data){
             $scope.phonenumber = data.val()
        })
        
        $rootScope.$watch('currentUserLoaded', function(){ 
            if($rootScope.currentUserLoaded){
                if($rootScope.currentUser.children){
                    $scope.zeroChildren = false;
                }
            }
        });
        

        $scope.times = [];
        for (var i = 0; i <= 48; i++) {
            var time = {
                "ms": 1800000 * i,
                "format": moment().startOf('day').add(30 * i, 'm').format("hh:mm A")
            }
            $scope.times.push(time);
        }

        $scope.reset = function(){
            $scope.matches = [];
            $scope.hideForm = false;
        }

        $scope.calcCost = function(pricing) {
            if(!pricing) { return }
            var cost = 0;
            // Determine in which age group each child falls
            for (var i = 0; i < $scope.selectedChildren.length; i++) {
                var age = moment().diff(moment($scope.selectedChildren[i].birthday), 'years');
                switch (true) {
                    case (age > 0 && age < 3):
                        //Childs age 1 to 2 = a
                        cost += pricing[0].rate
                        break;
                    case (age > 1 && age < 6):
                        //Childs age 2 to 5 = b
                        cost += pricing[1].rate
                        break;
                    case (age > 4 && age < 9):
                        //Childs age 5 to 8 = c
                        cost += pricing[2].rate
                        break;
                    case (age > 7 && age < 13):
                        //Childs age 8 to 12 = d
                        cost += pricing[3].rate
                        break;
                    case (age > 12):
                        //Childs age 12 + = e
                        cost += pricing[4].rate
                        break;
                }
            }
            cost = (cost * ($scope.endTime.ms - $scope.startTime.ms)) / 3600000;
            return cost;
        }

        $scope.find = function() {
            $scope.searching = true;
            var data = {
                "date": 1479596400000,
                "startTime": 21600000, // 6 am
                "endTime": 28800000 // 8 am
            }
            $http({
                method: 'POST',
                url: '/find',
                api: true,
                //timeout: 20000, // Request is taking too long
                data: {
                    "startTime": $scope.startTime.ms,
                    "endTime": $scope.endTime.ms,
                    "date": $scope.date.getTime()
                }
            }).then(function(res) {
                console.log(res);
                $scope.searching = false;
                $scope.hideForm = true;
                $scope.matches = res.data;
            }).catch(function(err) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Cannot find a babysitter')
                    .textContent('Please call us instead at ' + $scope.phonenumber)
                    .ariaLabel('Cannot find a babysitter')
                    .ok('Ok')
                );
                $scope.searching = false;
            });
        }

        /*Will create a booking
        @ params - babysitter: {id: uid, email: babysitter.email, name: babysitter.name}
        */
        $scope.book = function(babysitter) {
            // console.log(babysitter);
            // return;
            $http({
                method: 'POST',
                url: '/booking/create',
                api: true,
                data: {
                    startTime: moment($scope.date.getTime()).add($scope.startTime.ms, 'ms').valueOf(),
                    endTime: moment($scope.date.getTime()).add($scope.endTime.ms, 'ms').valueOf(),
                    day: $scope.date.getTime(),
                    parent: {
                        id: $scope.currentUser.$id,
                        street: $scope.currentUser.street,
                        zipcode: $scope.currentUser.zipCode,
                        children: $scope.selectedChildren,
                        email: $scope.currentUser.email,
                        name: $scope.currentUser.name
                    },
                    babysitter: {
                        id: babysitter.uid,
                        email: babysitter.email,
                        name: babysitter.name
                    }
                }
            }).then(function(data) {
                console.log(data);
                // To do show alert an email is going to be sent
                $mdDialog.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('Booking successful')
                    .textContent('An email is sent with further details.')
                    .ariaLabel('Booking successful')
                    .ok('Ok')
                );
            }).catch(function(err) {
                $toast('Booking failed');
                console.error(err);
            });
        }

    }
]);