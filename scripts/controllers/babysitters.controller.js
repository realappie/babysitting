app.controller('babysittersCtrl', ['$scope', '$state', '$rootScope', '$toast', '$firebaseObject', '$mdDialog', '$anchorScroll',
    function($scope, $state, $rootScope, $toast, $firebaseObject, $mdDialog, $anchorScroll) {

        $scope.amount = 10;
        $scope.babysittersLoaded = false;
        $scope.noBabysitters = false;
        $scope.max = false;

        $scope.update = function(amount, scrollDown) {
            $scope.babysittersLoaded = false;
            var babysittersRef = $rootScope.database.child('babysitters/').limitToFirst(amount);
            $scope.babysitters = $firebaseObject(babysittersRef);
            $scope.babysitters.$loaded(function() {
                $scope.babysittersLoaded = true;
                if (scrollDown) {
                    setTimeout(function() {
                        window.scrollTo(0, document.body.scrollHeight);
                    });                    
                }
                if ($scope.babysitters.$value === null){
                    $scope.noBabysitters = true;    
                }
            })
        }

        $scope.update($scope.amount, false);

        $scope.loadMore = function() {
            if ($scope.amount > Object.keys($scope.babysitters).length - 3) {
                $scope.max = true;
                return;
            }
            $scope.amount += 15;
            $scope.update($scope.amount, true);
            console.log($scope.amount);
        }

        $scope.email = function(email) {
            location.href = "mailto:" + email + "?Subject=Regarding a booking";
        }

        $scope.moreInfo = function(babysitter, key, event) {
            console.log(babysitter);
            $scope.uid = key;
            $scope.babysitter = babysitter;
            $mdDialog.show({
                contentElement: '#babySitterDialog',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: true,
                bindToController: true,
                fullscreen: true
            });
        };

        $scope.calculateAge = function(birthday) {
            return Math.abs(new Date(Date.now() - birthday).getUTCFullYear() - 1970);
        }

        $scope.closeDialog = function() {
            $mdDialog.hide();
        }


    }
]);