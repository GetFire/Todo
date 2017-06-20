// public/core.js
angular.module('scotchTodo', []);

function mainController($scope, $http) {
    $scope.todo = {};
    $scope.currentUser = {};

    $scope.login = function () {
        $http.get('/api/login', {headers: {'username': $scope.user.username, 'password': $scope.user.password}})
            .success(function (data) {
                $scope.currentUser = data;
                $scope.isAuth = true;
                $scope.user = {};
                $scope.error = false;

            })
            .error(function (data) {
                $scope.error = data.message;
                console.log('Error: ' + data.message);
            });
    };

    $scope.logout = function () {
        $scope.user = {};
        $scope.currentUser.token = false;
        $scope.currentUser = {};
        $scope.todos = {};
        $scope.todo = {};
        $scope.isAuth = false;
    };

    $scope.register = function () {
        $http.post('/api/user', $scope.user)
            .success(function (data) {
                $scope.isAuth = true;
                $scope.currentUser = data;
                $scope.user = {};
                $scope.error = false;
            }).error(function (data) {
            $scope.error = data.message;
            console.log('Error: ' + data.message);
        });
    };


    // when submitting the add form, send the text to the node API
    $scope.createTodo = function () {
        $scope.todo.token = $scope.currentUser.token;
        $http.post('/api/todo', $scope.todo)
            .success(function (data) {
                $scope.todo = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
            })
            .error(function (data) {
                console.log('Error: ' + data.message);
            });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function (id) {
        $http.delete('/api/todo/' + id, {headers: {'x-access-token': $scope.currentUser.token}})
            .success(function (data) {
                $scope.todos = data;
                $scope.error = false;
            })
            .error(function (data) {
                console.log('Error: ' + data.message);
            });
    };

    $scope.getAllTodos = function () {
        // when landing on the page, get all todos and show them
        $http.get('/api/todo', {headers: {'x-access-token': $scope.currentUser.token}})
            .success(function (data) {
                $scope.todos = data;
            })
            .error(function (data) {
                console.log('Error: ' + data.message);
            });
    };

    $scope.getMy = function () {
        $http.get('/api/todo/my', {
            headers: {'x-access-token': $scope.currentUser.token}
        })
            .success(function (data) {
                $scope.todos = data;
            })
            .error(function (data) {
                console.log('Error: ' + data.message);
            })
    };


}