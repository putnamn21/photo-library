var app = angular.module('photoApp', ['ngFileUpload']);


app.controller('mainController', ['$scope','Upload','$http', '$timeout', function($scope,Upload,$http,$timeout){
  
    //grabs session user
    function refreshUser(){
      $scope.user = JSON.parse(sessionStorage.getItem('user'));

      if($scope.user === null)
      {
        console.log('no user logged in');
        $scope.user = 
          {
            success: false,
            user: false,
            token: false
          }
      };
    };
    refreshUser();
  
  // API AJAX Requests ==================================================================


      // GET photos --- auto run when landing on page
            $http({
              method: 'GET',
              url: '/api/photos',
              headers: {'authorization': $scope.user.token}
                  }).then(function successCallback(response) {
                        $scope.photos = response.data;
                        $scope.mainImage = response.data[0];
                        var path = window.location.pathname;
                        if(path !== "/"){
                          window.location.pathname = '/';
                          }
                    }, function errorCallback(response) {
                         console.log('Error: ' + response.statusText);
                    });
      // --------------------------------------------


      // LOGIN request
            $scope.loginUser = function(){
              
                //grab form data
                var user = {
                  userName: $scope.loginFormUser,
                  password: $scope.loginFormPass
                }
                
                //post it to login
                $http({
                  method: 'POST',
                  url:'/login', 
                  data: user,
                  headers: {'authorization': $scope.user.token},
                }).then(function successCallback(response) {
                          console.log(response);
                  
                          
                      

                          
                          if(!response.data.success){
                            $scope.formError = response.data.message;
                            return
                          }
                          $('#logInModal').modal("hide");
                          $scope.loginFormUser = '';
                          $scope.loginFormPass = '';
                          sessionStorage.setItem('user', JSON.stringify(response.data));
                          refreshUser();
                    }, function errorCallback(response) {
                      console.log('Error: ' + response.status);
                      $scope.formError = 'Failed to login!';
                    }) 
            };


      // REGISTER User request
            $scope.registerNewUser = function(){
              
              if($scope.registerFormPass !== $scope.registerFormPass1){
                $scope.formError = 'Passwords do not match';
                return
              }
              
              var user = {
                name: $scope.registerFormUser,
                password: $scope.registerFormPass
              };
              
              $http({
                method: 'POST',
                url:'/login/newUser', 
                data: user,
                headers: {'authorization': $scope.user.token}
                      }).then(function successCallback(response) {
                
                      console.log(response);
                
                      $scope.registerFormUser = '';
                      $scope.registerFormPass = '';
                      $scope.registerFormPass1 = '';
                      
                     
                      sessionStorage.setItem('user', JSON.stringify(response.data));
                      refreshUser();
                  }, function errorCallback(response) {
                      console.log('Error: ' + response.status);
                      $scope.formError = 'Failed to create new user!';
                  });
            };  


      // DELETE photos
            $scope.deletePhoto = function (photoId, photoFileName) {

              $http({
                method: "DELETE",
                url:'/api/photos/' + photoId + '/' +photoFileName,
                headers: {'authorization': $scope.user.token}
                }).then(function successCallback(response) {
                    $scope.photos = response.data;
                }, function errorCallback(response) {
                    console.log('Error: ' + response);
                });
              
            };
  
  
      // UPLOAD photo
            $scope.uploadPhoto = function (file) {
                  file.upload = Upload.upload({
                      url: '/api/upload',
                      headers: {'authorization': $scope.user.token},
                      data: {
                              file: file, 
                              lat: $scope.lat,
                              long: $scope.long,
                              location: $scope.location,
                              camera: $scope.camera
                            }
                  });
              
                  file.upload.then(function (response) {
                    $scope.photos.push(response.data);
                    var a = $scope.photos.length-1;
                    $scope.mainImage = $scope.photos[a];
                    
                    $timeout(function(){
                          $scope.photoUploadFile = ''; 
                          $scope.lat = '';
                          $scope.long = '';
                          $scope.location = '';
                          $scope.camera = '';
                        }, 2000);
                    
                  }, function (response) {
                      console.log('Error status: ' + response.status);
                  }, function (evt) {
                      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                  });
              };


  // END API Ajax requests  =========================================================





  // UI Changes =====================================================================

    $scope.makeBig = function (photo){
      $scope.mainImage = photo;
    };
  
    $scope.logout = function(){
      sessionStorage.setItem('user', null);
      refreshUser();
    };
  
}]); // end of main controller +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


