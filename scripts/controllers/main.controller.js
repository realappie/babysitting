app.controller('mainCtrl', ['$scope', '$state', '$rootScope', '$toast', '$firebaseAuth', '$firebaseObject', '$mdDialog',
		function($scope, $state, $rootScope, $toast, $firebaseAuth, $firebaseObject, $mdDialog){
	    $scope.state = $state;
	    $scope.user = {};	    
	    $rootScope.navOpen = false;
	    $scope.navTapped = false;
	    $scope.auth = $firebaseAuth();
	    
		//var provider = new firebase.auth.GoogleAuthProvider();	

		$rootScope.slideAway = function(){
			document.querySelector('#sideNav').className = "mobile";
            document.querySelector('#overlay').className = "mobile fadeOut";
            setTimeout(function(){
              document.querySelector('#overlay').className = "mobile";      
            }, 300);     
		}

		$scope.toggleNav = function(){			
			setTimeout(function(){
				$scope.navTapped = false;
			}, 300);
			if($scope.navTapped){
				return;
			}
			if(!$rootScope.navOpen){
				 document.querySelector('#sideNav').className += " show";  
           		 document.querySelector('#overlay').className += " show";
			}else{
                $scope.slideAway();           
			}
			$rootScope.navOpen = !$rootScope.navOpen;
			$scope.navTapped = true;
		}	


		$scope.signInWithGoogle = function(){
			var provider = new firebase.auth.GoogleAuthProvider();

			firebase.auth().signInWithPopup(provider)
				.then(function(data) {
				  return $scope.database.child('users/' + data.user.uid).once('value')
				})
				.then(function(data){
					console.log(data.val());
					if(data.val() == null){
						$toast('Please Register First');
						$state.go('register', {"googleLogin": true});
					}else{
						$state.go('accountPage');
					}
				})
				.catch(function(error) {
				  	$toast('Google Login Failed');
				  	console.log(error);
				});
		}

		$scope.forgotPassword = function(){
			$mdDialog.show({
                contentElement: '#forgotPassword',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                fullscreen: true
            });
		}

		$scope.requestResetLink = function(){
			firebase.auth().sendPasswordResetEmail($scope.user.email)	
				.then(function(data){
					console.log(data);
					$toast("Password reset link sent");					
				}).catch(function(err){
					console.error(err);
					$toast("Password reset link not sent");
				});
			$mdDialog.hide();
		}
		$scope.closeDialog = function(){
			$mdDialog.hide();
		}

		//https://github.com/firebase/angularfire/blob/master/docs/reference.md#firebaseauth
		$scope.login = function(){
			firebase.auth().signInWithEmailAndPassword($scope.user.email, $scope.user.password)
				.then(function(data){
					$rootScope.authStateLoaded = false;
					$scope.fetchUserData(data.uid);
					// Go to choice screen, see notes.md for reference 
					$state.go('babysitters');
				 	$toast('Welcome!');
			    })
				.catch(function(err){
					console.log("error", err);
					if(err.code == 'auth/user-not-found'){
					 $toast('Unrecognized email');
					}
					if(err.code == 'auth/wrong-password'){						
					 $toast('Wrong password');
					}
				})
		}
		$scope.logout = function(){
			firebase.auth().signOut().then(function() {
			   $rootScope.loggedIn = false;
		   	   window.location.reload();
			   $toast('Logged out!');			    
			}, function(error) {
			   $toast('Logout failed!');			    
			});
		}


	}])