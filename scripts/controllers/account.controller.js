app.controller('accountCtrl', ['$scope', '$rootScope', '$toast', '$state', '$stateParams', '$firebaseArray', '$firebaseObject',
    function($scope, $rootScope, $toast, $state, $stateParams, $firebaseArray, $firebaseObject) {
    $scope.children = [];
    $scope.zeroChildren = false;
    $scope.childrenLoaded = false;
    $scope.currentUserLoaded = false;
    $scope.bookingsLoaded = false;
    $scope.user = {};
    $scope.pages = {
        parent: 'pages/parent.html',
        babysitter: 'pages/babysitter.html',
        personal: 'pages/personalInfo.html'
    }
    $scope.invalidPricingForm = false;
    $scope.pricingLoaded = false;
    $scope.pricingForm = [];
    $scope.ageGroups = {};
    $scope.workHours = [];
    $scope.bookings = [];
    $scope.emptyBookings = false;

    // For the select menus of the drop down menu of work hours 
    $scope.times = [];
    for (var i = 0; i <= 48; i++) {
        var time = {
            "ms": 1800000 * i,
            "format": moment().startOf('day').add(30 * i, 'm').format("hh:mm A")
        }
        $scope.times.push(time);
    }

    if($stateParams.tab == 'parent'){
        $scope.parentTab = true;
    }

    $rootScope.$watch('currentUserLoaded', function() {
        if ($rootScope.currentUser) {
            $scope.currentUserLoaded = true;
            var uid = $rootScope.currentUser.$id;
            // Needed info to show edit-able data
            $scope.user = {
                name: $rootScope.currentUser.name,
                locationCity: $rootScope.currentUser.locationCity,
                zipCode: $rootScope.currentUser.zipCode,
                street: $rootScope.currentUser.street
            }

            $scope.userTypes = [{
                "icon": "person",
                "description": "parent",
                "model": angular.copy($rootScope.currentUser.userType.parent)
            }, {
                "icon": "child_friendly",
                "description": "babysitter",
                "model": angular.copy($rootScope.currentUser.userType.babySitter)
            }]
            
            $scope.workHours = angular.copy($rootScope.currentUser.workHours);

            $scope.updatePricing(uid);

            $scope.children = $firebaseArray($scope.database.child('users/' + uid + '/children'));
            $scope.children.$loaded()
                .then(function(data) {
                    $scope.childrenLoaded = true;
                    data.length == 0 ? $scope.zeroChildren = true : $scope.zeroChildren = false;
                })
            $scope.children.$watch(function(){
                $scope.children.length == 0 ? $scope.zeroChildren = true : $scope.zeroChildren = false;
            })

            $scope.bookings = $firebaseObject($scope.database.child('bookingStatus/' + uid));
            $scope.bookings.$loaded()
                .then(function(data){
                    console.log(data.$value);
                    console.log(data);
                    $scope.bookingsLoaded = true;
                    if(data.$value === null || data.$value !== undefined) $scope.emptyBookings = true;
                    console.log($scope.emptyBookings);
                }).catch(function(err){ console.error(err) })
        }
    });

    $scope.updatePricing = function(uid) {
        $scope.database.child('babysitters/' + uid + '/pricing').once('value')
            .then(function(data) {
                if (!data.val()) {$scope.ageGroups = angular.copy($rootScope.defaultAgeGroups);}
                    else{
                	   $scope.ageGroups = data.val();
                    }
                $scope.pricingLoaded = true;
                $scope.$apply();
            })
            .catch(function(err) {
                console.error(err);
            })
    }
    
    $scope.workHours = angular.copy($rootScope.defaultWorkHours);

    /*$scope.updateHours = function(uid){
        $scope.database.child('babysitters/' + uid + '/workHours').once('value')
            .then(function(data){
                if(!data.val()){ $scope.workHours = angular.copy($rootScope.defaultWorkHours)}
                    else{
                        $scope.workHours = data.val();
                    }
                console.log(data);
            }).catch(function(err){
                console.error(err);
            });
    }*/


    $scope.deleteChild = function(child) {
        var index = $scope.children.indexOf(child);
        console.log(child);
        console.log(index);
        $scope.children.$remove(index)
            .then(function() {
                console.log("item removed");
                $toast(child.name + " removed");
            });
        console.log($scope.children);
        if ($scope.children.length == 0) {
            $scope.zeroChildren = true;
        }
    }

    $scope.updateProfile = function() {
    	// errors here, babysitter write is valid, probably something going wrong with the users write, check out online site for code comparsion
    	var updateProfileData = {};
        updateProfileData['users/' + $scope.currentUser.$id + '/name'] = $scope.user.name;
        updateProfileData['users/' + $scope.currentUser.$id + '/locationCity'] = $scope.user.locationCity;
        if($scope.currentUser.userType.parent){
           updateProfileData['users/' + $scope.currentUser.$id + '/zipCode'] = $scope.user.zipCode;
    	   updateProfileData['users/' + $scope.currentUser.$id + '/street'] = $scope.user.street;
        }else{
           updateProfileData['babysitters/' + $scope.currentUser.$id + '/name'] = $scope.user.name;
    	   updateProfileData['babysitters/' + $scope.currentUser.$id + '/locationCity'] = $scope.user.locationCity;            
        }

    	console.log(updateProfileData);
        $scope.database.update(updateProfileData)
            .then(function(data) {
                console.log(data);
            })
            .catch(function(err) {
                console.error(err);
            })
    }

    $scope.updateUserType = function(type) {
        var userPath = 'users/' + $scope.currentUser.$id;
        var uid = $scope.currentUser.$id;

        if (type.description === "parent") {
            var updateParentData = {}
            updateParentData[userPath + '/userType/parent'] = type.model;
            if ($rootScope.currentUser.userType.parent) {
                console.log('deleting children node');
                updateParentData[userPath + '/children/'] = null;
            }
            $scope.database.update(updateParentData)
                .then(function(data) {
                    $toast('Successfully changed account');
                    console.log(data);
                })
                .catch(function(err) {
                    console.log(error);
                })
        }

        if (type.description === 'babysitter') {
            var updateBabySitterData = {};

            updateBabySitterData[userPath + '/userType/babySitter'] = type.model;

            if ($rootScope.currentUser.userType.babySitter) {
                // The user is currently a babysitter, but does not want it anymore. Delete babysitter associated data
                updateBabySitterData[userPath + "/pricing"] = null;
                updateBabySitterData['babysitters/' + uid] = null;
            } else {
                // The user is not a babysitter, but wants to become one
                updateBabySitterData['babysitters/' + uid] = {
                    workHours: $rootScope.defaultWorkHours,
                    pricing: $rootScope.defaultAgeGroups,
                    photoURL: $scope.currentUser.photoURL,
                    locationCity: $scope.currentUser.locationCity,
                    birthDay: $scope.currentUser.birthDay,
                    email: $scope.currentUser.email,
                    name: $scope.currentUser.name
                }

                updateBabySitterData['users/' + uid + '/pricing'] = $rootScope.defaultAgeGroups;
                
                $scope.updatePricing(uid);
            }

            $scope.database.update(updateBabySitterData)
                .then(function(data) {
                    $toast('Successfully changed account');
                    console.log(data);
                })
                .catch(function(err) {
                    console.log(err);
                })
        }
        console.log(type.model);
        console.log($rootScope.currentUser.userType);
    }

    $scope.saveHours = function(){
        var updateHoursData = {};
        var uid = $rootScope.currentUser.$id;

        console.log($scope.workHours);

        $scope.workHoursToSave = $scope.workHours.map(function(obj){
            delete obj['$$hashKey'];
            return obj
        });

        updateHoursData['users/' + uid + '/workHours/'] = updateHoursData['babysitters/' + uid + '/workHours'] = $scope.workHoursToSave;
        $scope.database.update(updateHoursData)
            .then(function(data){
                $toast("Hours updated");
            }).catch(function(err){
                console.error(err);
                $toast("Failed to update");
            })
            
    }

    $scope.savePricing = function() {
        var updatePricingData = {};
        var uid = $rootScope.currentUser.$id;

        $scope.ageGroupsToSave = $scope.ageGroups.map(function(obj) {
            delete obj["$$hashKey"];
            return obj;
        });
        console.log($scope.ageGroupsToSave);

        updatePricingData['users/' + uid + '/pricing/'] = updatePricingData['babysitters/' + uid + '/pricing/'] = $scope.ageGroupsToSave;
        $scope.database.update(updatePricingData)
            .then(function(data){
                console.log(data);
                $toast('Pricing updated');
            }).catch(function(err){
                console.error(err);
                $toast("Failed to update");
            })
            
    }

    $scope.checkForms = function() {
        for (var i = 0; i < $scope.pricingForm.length; i++) {
            if ($scope.pricingForm[i].$invalid) {
                $scope.invalidPricingForm = true;
                break;
            } else { $scope.invalidPricingForm = false }
        }
    }

    $scope.showBookingInformation = function(bookingID){
        console.log(bookingID);
        $state.go('bookingDetails', {id: bookingID});
    }

}]);