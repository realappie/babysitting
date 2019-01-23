app.controller('registerCtrl', ['$scope', '$state', '$rootScope', '$toast', '$stateParams', '$mdDialog' ,
	function($scope, $state, $rootScope, $toast, $stateParams, $mdDialog){
		$scope.user = {
			photoURL: 'https://i.gyazo.com/7fe293e6af9d0bc2dd9fe105679b21e1.png',
			password: null,
			passwordRepeat: null
		};
		$scope.user.userType = {
			parent: false,
			babySitter: false
		};
		//fb = firebase.auth().currentUser.providerData[0].providerId;
		$rootScope.$watch('loggedIn', function(){
			console.log('$rootScope.authData', $rootScope.authData);
			if($rootScope.loggedIn){
				if($rootScope.authData.providerData[0].providerId == 'google.com'){
					$scope.filledLoggedInGoogleData();
				}	
			}
		})
		console.log("google login ", $stateParams.googleLogin);
		console.log('$rootScope.loggedIn ', $rootScope.loggedIn);
		$scope.filledLoggedInGoogleData = function(){
			if($stateParams.googleLogin || $rootScope.loggedIn === true){
				console.log("running logged in code");
				$scope.passwordChecked = true;
				$scope.googleLoginFinished = true;
				var user = firebase.auth().currentUser;
				$scope.user.name = user.displayName;
				$scope.user.uid = user.uid;
				$scope.user.photoURL = user.photoURL;
				$scope.user.email = user.email;
			}
		}
		
		
		$scope.birthDay = null;
		// Users must be at least 18 year old
		var minAge = moment.duration(18, 'years');
		// Today minus 18 years
		$scope.maxDate = moment().subtract(minAge).toDate();
		// $scope.maxDate = new Date(1009839600000);
		$scope.passwordChecked = false;
		
		$scope.reDoLoginInfo = function(){
			$scope.passwordChecked = false;
			$scope.user.password = "";
			$scope.user.passwordRepeat = "";
		}

		$scope.checkPassword = function(){
			if($scope.user.password.length >= 7 && $scope.user.password === $scope.user.passwordRepeat){
				$scope.passwordChecked = true;
			}else{
				$scope.passwordChecked = false;
			}
		}

		$scope.signUpWithEmail = function(){
			$scope.withEmail = true;
			$scope.chosen = true;
		}

		$scope.check = function(){
			
		}		


		$scope.checkCheckbox = function(){
			if($scope.user.userType.parent || $scope.user.userType.babySitter ){
				$scope.userChosen = true;
			}
		}

		/*	
			Registering a user function
			@params googleLogin - boolean - specifies if its a google login or not
		*/
		$scope.register = function(){
			if($scope.googleLoginFinished){
				$scope.registerInDatabase($scope.user.uid);
				return;
			}
			
			if($scope.user.password !== $scope.user.passwordRepeat){
			   $toast("Passwords don't match");
			  	return;
			}
			// Register -> Programmatically login -> set data in database by calling the function

			firebase.auth().createUserWithEmailAndPassword($scope.user.email, $scope.user.password)
			.then(function(data){
				console.log(data)
				firebase.auth().signInWithEmailAndPassword($scope.user.email, $scope.user.password)
				.then(function(data){
					console.log(data);
					$scope.registerInDatabase(data.uid);
				})
				.catch(function(error) {
				  console.log(error)
				});
			})
			.catch(function(error) {
			  // Handle Errors here.
			  console.log(error);
			  var errorCode = error.code;
			  var errorMessage = error.message;
			   if(error.code == 'auth/email-already-in-use'){
			   	 $toast('Email Already In Use.');
			   }else{
			   	 $toast('Registration Failed.');
			   }
			});	
		}
		$scope.resetEmailChoice = function(){
			$scope.withEmail = false; 
			$scope.chosen = false
		}

		$scope.signInWithGoogle = function(){
		/*$scope.googleLoginFinished = true;
		$scope.passwordChecked = true;
		$scope.user.email = "Abdallaroc@gmail.com";
		return;*/

		var provider = new firebase.auth.GoogleAuthProvider();

		firebase.auth().signInWithPopup(provider)
			.then(function(data) {
			  console.log(data);
			  // This gives you a Google Access Token. You can use it to access the Google API.
			  var token = data.credential.accessToken;
			  // The signed-in user info.
			  var user = data.user;
			  $scope.$apply(function(){
			  	$scope.passwordChecked = true;
			  	$scope.googleLoginFinished = true;
			  	//To do, store the user name
			  	$scope.user.name = data.user.displayName;
			  	$scope.user.uid = data.user.uid;
			  	$scope.user.photoURL = data.user.photoURL;
			  	$scope.user.email = data.user.email;
			  })
			  
			  //$scope.registerInDatabase(result.user.uid);
			  // ...
			})
			.catch(function(error) {
			  	$toast('Registration with Google failed');
			  	console.log(error);
			});
		}


		/*
			To register the user information in the database, this function is called by both normal the registration and the google registeration
			@params uid - string - the uid of the user, given in the callback by either signInWithPopup or signInWithEmailAndPassword firebase authentication methods
		*/
		$scope.registerInDatabase = function(uid){
			console.group('Registering in database');
			var updateUserData = {};
			$scope.user.birthDay = $scope.birthDay.getTime();
			console.log($scope.user);
			delete $scope.user['password']; 
			delete $scope.user['passwordRepeat'];

			if($scope.user.userType.babySitter === true){
				console.log("user is a babysitter")
				updateUserData['babysitters/' + uid] = {
					workHours: $rootScope.defaultWorkHours,
					pricing: $rootScope.defaultAgeGroups,
					photoURL: $scope.user.photoURL,
					locationCity: $scope.user.locationCity,
					birthDay: $scope.user.birthDay,
					email : $scope.user.email,
					name: $scope.user.name
				};	
				$scope.user.pricing = $rootScope.defaultAgeGroups;
				$scope.user.workHours = $rootScope.defaultWorkHours
				// Counter code
				/*$scope.database.child('babysitters/counter').transaction(function(data){
					console.log(data)
					return data + 1;
				})
				.then(function(result){
					console.log(result);
				});*/
				// Counter code end
			}
			console.log(updateUserData);
			updateUserData['users/' + uid] = $scope.user;			

			console.log("update user data is" + updateUserData);
			$scope.database.update(updateUserData)
				.then(function(data){
					console.log('database filled');
					$toast('Registration successful');
					if($scope.user.userType.babySitter && $scope.user.userType.parent){
						$state.go('accountPage');
					}
					if($scope.user.userType.babySitter){
						$state.go('accountPage');
					}
					if($scope.user.userType.parent){
						$state.go('booking');
					}
					$scope.$apply(function(){
						$rootScope.incompleteData = false;
					})
				})
				.catch(function(data){
					console.error(data);
					$toast('Registration failed!');
				});
				console.groupEnd();
		}
}]);