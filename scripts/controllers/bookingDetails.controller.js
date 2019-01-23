app.controller('bookingDetails', 
	['$scope', '$state', '$rootScope', '$toast', '$firebaseObject', '$stateParams', '$mdDialog', '$http',
	function($scope, $state, $rootScope, $toast, $firebaseObject, $stateParams, $mdDialog, $http){
	    $scope.bookingLoaded = false;
		$scope.companyEmail;
			
		$scope.calculateAge = function(birthday) {
        	return Math.abs(new Date(Date.now() - birthday).getUTCFullYear() - 1970);
    	}

		 $rootScope.$watch('currentUserLoaded', function() {
        	if ($rootScope.currentUser) {
          		var bookingDetails = $rootScope.database.child('bookingStatus/' + $rootScope.currentUser.$id + "/" + $stateParams.id)
          		$scope.booking = $firebaseObject(bookingDetails);

          		$scope.booking.$loaded()
	          		.then(function(data){
	                    $scope.bookingLoaded = true;
	                    if(data.$value === null) {
	                    	$toast("Booking not found");
	                    	$state.go("accountPage")
	                    }
	                }).catch(function(err){ console.error(err) })
        	}
    	});

		 $scope.report = function(event){
		 	$rootScope.database.child('company/email').once('value')
				.then(function(data){
					$scope.companyEmail = data.val()
				}).catch(function(err){
					console.error(err);
				});
		 	$mdDialog.show({
                contentElement: '#reportDialog',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
            });
		 }

		 $scope.closeDialog = function(){
			$mdDialog.hide();
		 }

		 $scope.cancelBooking = function(ev){
		 	 // Appending dialog to document.body to cover sidenav in docs app
			var confirm = $mdDialog.confirm()
			      .title('Are you sure?')
			      .textContent('This will cancel the booking')
			      .ariaLabel('Cancel booking')
			      .targetEvent(ev)
			      .ok("Cancel booking")
			      .cancel("Don't cancel booking");

			$mdDialog.show(confirm).then(function() {
				  $http({
			 		method: 'POST',
		            url: '/booking/cancel',
		            api: true,
		            data: {
		            	bookingID    : $scope.booking.$id,
		            	parentID     : $scope.booking.parent.id,
		            	babysitterID : $scope.booking.babysitter.id
		            }
				 })
			}, function() {});
			 
		 }

}]);
	