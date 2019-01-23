app.controller('childrenCtrl', ['$scope', '$rootScope', '$toast', '$state', '$firebaseArray','$stateParams', '$timeout', function($scope, $rootScope, $toast, $state, $firebaseArray, $stateParams, $timeout){
		$scope.children = [{birthday: null, name: null}];
		$scope.emptyChildren = true;
		$scope.maxChildren = false;   
		$scope.remoteChildrenLoaded = false;
		$scope.remoteChildren = [];
		$scope.editMode = false;
		console.log($stateParams.edit);
		if($stateParams.edit === "true"){
			console.log($stateParams.edit);
			$scope.editMode = true;
			$scope.children = [];
		}

		// Child max age
		var maxAge = moment.duration(16, 'years');		
		$scope.minDate = moment().subtract(maxAge, 'years').toDate();
		$scope.maxDate = moment().subtract(1, 'years').toDate();

		$rootScope.$watch('currentUserLoaded', function(){
			console.log($rootScope.currentUser);
			if($rootScope.currentUser !== undefined){
				var uid = $rootScope.currentUser.$id;
				$scope.remoteChildren = $firebaseArray($scope.database.child('users/' + uid + '/children'));
				$scope.remoteChildren.$loaded(function(){
					$scope.remoteChildrenLoaded = true;
					if($scope.editMode){
						console.info('loading server data');
						for(var i = 0; i < $scope.remoteChildren.length; i++){
							console.log($scope.remoteChildren[i]);
							$scope.toPushChild = angular.copy($scope.remoteChildren[i]);
							$scope.toPushChild.birthday = new Date($scope.toPushChild.birthday);
							$scope.children.push($scope.toPushChild);
							$scope.updateAges();
						}
					}					
				})
				$scope.remoteChildren.$watch(function(e){
					console.log($scope.remoteChildren.length);
					if($scope.remoteChildren.length + $scope.children.length >= 3){
						$scope.maxChildren = true;	
					}
				})
			}
		});

		/*Wrapped in a function because the collection will be checked once the controller is fired up, and at that point the children
		Array doesn't exist so this code would cause errors.*/

		$scope.$watchCollection('children', function(){
			$scope.emptyChildren = false;
			if($scope.children.length > 2){
				$scope.maxChildren = true;
			}				
			if($scope.children.length == 0 && $scope.remoteChildren.length == 0){
				$scope.emptyChildren = true;
			}			
			if($scope.remoteChildren.length + $scope.children.length >= 3){
				$scope.maxChildren = true;	
			}
		});

		$scope.updateAges = function(){
			for (var i = 0; i < $scope.children.length; i++) {
				var date = moment(new Date($scope.children[i].birthday));
				var age = moment(date).fromNow(true);
				$scope.children[i].age = age;
			}
		}

		$scope.addChildForm = function(){
			$scope.children.push({birthday: null, name: null});
		}

		$scope.removeChild = function(child){
			var index = $scope.children.indexOf(child);
			$scope.children.splice(index,1);
			$scope.maxChildren = false;
			$scope.remoteChildren.$remove(index)
				.then(function(){
					console.log("item removed");
					$toast(child.name + " removed");
				})
		}
		$scope.saveChild = function(child){
			console.log(child);
			$scope.database.child('users/' + $rootScope.currentUser.$id + '/children/' + child.$id).update({
				name: child.name,
				birthday: child.birthday.getTime()
			}).then(function(data){
					console.log(data);
					$toast('Child edited');
				})
				.catch(function(err){
					console.error(err);
					$toast('Child editing failed');
				});
		}

		$scope.addChild = function(child, $event, index){
			console.group('adding child');
			if($scope.remoteChildren.length >= 3){
				$toast('You already have 3 children');
				$scope.maxChildren = true;
			}else{
				$scope.remoteChildren.$add({
					name: child.name,
					birthday: child.birthday.getTime()
				}).then(function(data){
					console.log(data);
					$toast(child.name + " added");
				}).catch(function(err){
					console.error(err);
					$toast('Adding child failed');
				})
			}

		}
}])