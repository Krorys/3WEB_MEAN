angular.module('bsApp')
.controller('GameCtrl', GameCtrl);

function GameCtrl($scope, $rootScope, $http, $state, $stateParams, socket, isGameValid) {

    // console.log(isGameValid);
    $scope.game = isGameValid;

    if ($scope.game.status === 'closed' && $scope.game.creator.username !== $scope.user.username && $scope.game.opponent.username !== $scope.user.username)
        $state.go('lobby');

    socket.connect('/game');
    socket.emit('userJoin', {game: isGameValid, username: $scope.user.username});

    updateTitle();
    $scope.board = [];
    fillBoard($scope.board);
    $scope.isPlayerBoardShown = true;

    $scope.shipsAvailable = {
        carriers: {
            name: 'Carriers',
            size: 5,
            nb: 1,
            color: 'lime'
        },
        battleships: {
            name: 'Battleships',
            size: 4,
            nb: 2,
            color: 'mediumorchid'
        },
        submarines: {
            name: 'Submarines',
            size: 3,
            nb: 1,
            color: 'coral'
        },  
        destroyers: {
            name: 'Destroyers',
            size: 2,
            nb: 3,
            color: 'royalblue'
        }
    };

    $scope.shipsPlaced = [];

    $scope.pickShip = (ship) => $scope.selectedShip = ship;
    $scope.swapOrientation = () => $scope.isOrientationVertical = ! $scope.isOrientationVertical;

    $scope.selectedCells = [];
    $scope.cleanSelectedCells = function() {
        // Cleaning selected cases from previous hover
        for (var x = 0; x < $scope.selectedCells.length; x++) 
            $scope.selectedCells[x].hoverState = '';
        $scope.selectedCells = [];
    };

    $scope.cellHover = function(cell) {
        // console.log(cell);
        $scope.cleanSelectedCells();

        if ($scope.selectedShip) {
            /* Pour selectionner les cases AUTOUR (-1, +1) de la case cible
            for (var i = -1; i < 2; i++)
                for (var j = -1; j < 2; j++)
                    if (i+j == -1 || i+j == 1)
                        console.log($scope.board[cell.posX+i][cell.posY+j]);
            */

            $scope.hoverError = false;
            for (var i = 0; i < $scope.selectedShip.size; i++) {
                var orientation = ($scope.isOrientationVertical) ? i + cell.posX : i + cell.posY;
                var isTooFar = (orientation > 8);
                if (isTooFar) {
                    $scope.hoverError = true;
                    break;
                }
                var isCellUsed = ($scope.isOrientationVertical) ? $scope.board[i + cell.posX][cell.posY].state === 'used' : $scope.board[cell.posX][i + cell.posY].state === 'used';
                if (isCellUsed) {
                    $scope.hoverError = true;
                        break;
                }  
                var selectedCell = ($scope.isOrientationVertical) ? $scope.board[cell.posX+i][cell.posY] : $scope.board[cell.posX][cell.posY+i];
                selectedCell.hoverState = $scope.selectedShip.color;
                $scope.selectedCells.push(selectedCell);
            }
            // If we went too far, notify the user that he can't place his ship
            if ($scope.hoverError)
                for (var x = 0; x < $scope.selectedCells.length; x++)
                    $scope.selectedCells[x].hoverState = 'error';
        }
        else {
            if (cell.state == 'used')
                return;
            cell.hoverState = 'select';
            $scope.selectedCells.push(cell);
        }
    };

    $scope.hasShipsLeft = true;
    $scope.checkShipsLeft = function() {
        // Sums of every type of ships
        var count = 0;
        for (var key in $scope.shipsAvailable)
            if ($scope.shipsAvailable.hasOwnProperty(key))
                count += $scope.shipsAvailable[key].nb;
        if (count == 0)
            $scope.hasShipsLeft = false;
    };

    document.addEventListener('keydown', function(e) {
         if(e.keyCode === 90 && e.ctrlKey && $scope.shipsPlaced.length > 0)
            $scope.cancelShip();        
    });


    $scope.cancelShip = function() {
        var cancelledShip = $scope.shipsPlaced.pop();

        // Reset used cells
        for (var i = 0; i < cancelledShip.cells.length; i++)
            $scope.board[cancelledShip.cells[i].posX][cancelledShip.cells[i].posY] = {
                posX: cancelledShip.cells[i].posX,
                posY: cancelledShip.cells[i].posY,
                state: '',
                hoverState: ''
            };

        // Retrieve the right ship & add back one
        for (var key in $scope.shipsAvailable)
            if ($scope.shipsAvailable.hasOwnProperty(key))
                if (key === cancelledShip.name.toLowerCase())
                    $scope.shipsAvailable[key].nb++;
    };

    $scope.resetBoard = function() {
        while($scope.shipsPlaced.length > 0)
            $scope.cancelShip();
    };

    $scope.placeShip = function() {
        if (!$scope.selectedShip || $scope.hoverError)
            return;
            
        var newShip = {
            name: $scope.selectedShip.name,
            cells: []
        };

        for (var i = 0; i < $scope.selectedCells.length; i++) {
            var element = $scope.selectedCells[i];
            element.state = 'used';
            element.orientation = ($scope.isOrientationVertical ? 'vertical' : 'horizontal');
            element.shipStart = (i == 0 ? true : false);
            element.name = $scope.selectedShip.name;
            element.shipEnd = (i + 1 == $scope.selectedCells.length ? true : false);
            newShip.cells.push(element);
        }

        $scope.selectedCells = [];
        $scope.shipsPlaced.push(newShip);
        $scope.selectedShip.nb--;
        if ($scope.selectedShip.nb < 1)
            $scope.selectedShip = undefined;
        $scope.checkShipsLeft();
    };

    $scope.ready = function() {
        console.log($scope.shipsPlaced);
        socket.emit('userReady', {ships: $scope.shipsPlaced, username: $scope.user.username, game: $scope.game});
        $scope.isReady = true;
    };

    $scope.swapBoards = function() {
        $scope.isPlayerBoardShown = !$scope.isPlayerBoardShown;
    };

    $scope.cellHoverInGame = function(cell) {
        if ($scope.canPlay) {
            $scope.cleanSelectedCells();
            if (cell.state == 'checked' || cell.state == 'hit')
                return;
            cell.hoverState = 'select';
            $scope.selectedCells.push(cell);
        }
    };

    $scope.shoot = function(cell) {
        if ($scope.canPlay) {
            socket.emit('shoot', cell);
            $scope.canPlay = false;
        }
    };

    function updateGame(fields) {
        $http.post('/api/games/' + $scope.game._id, fields)
        .then(function(result) {
            if (result.data.success)
                socket.emit('gameUpdated', result.data.game);
            // console.log(result.data.game);
        },
        function(result) {
            console.log('Error: ' + result);
        });
    }

    function updateTitle() {
        if ($scope.game.status === 'open')
            $scope.gameTitle = 'Game created by : ' + $scope.game.creator.username + '. Waiting for an opponent...';
        else
            $scope.gameTitle = 'Game X : ' + $scope.game.creator.username + ' VS ' + $scope.game.opponent.username;
    }

    function fillBoard(board) {
        var boardLength = 9;
        for (var i = 0; i < boardLength; i++) {
            board.push([]);
            for (var j = 0; j < boardLength; j++) {
                var cell = {
                    posX: i,
                    posY: j,
                    state: '', // used || alive || destroyed
                    hoverState: ''
                };
                board[i].push(cell);
            }
        }
        // console.log(board);
    }

    function changePlayerTurn(turn) {
        $scope.canPlay = (turn === $scope.user.username);
        $scope.playerTurn = turn;
    }

    // SOCKETS RECEIVED 
    /*
    socket.on('updateGame', function () {
        var fields = { opponent: $scope.user.username, status: 'closed' };
        $http.post('/api/games/' + $scope.game._id, fields)
        .then(function(result) {
            if (result.data.success)
                socket.emit('gameClosed', result.data.game);
            // console.log(result.data.game);
        },
        function(result) {
            console.log('Error: ' + result);
        });
    });
    */

    socket.on('updateGameInDb', function(fields) {
        updateGame(fields);
    });

    socket.on('overwriteGame', function (game) {
        $scope.game = game;
        updateTitle();
    });

    socket.on('notifyReady', function(name) {
        console.log(name + ' is ready');
        // new msg dans le chat avec name is ready
    });
    
    socket.on('gameStart', function(playerTurn) {
        console.log('game start');
        $scope.guessBoard = [];
        fillBoard($scope.guessBoard);
        $scope.swapBoards();
        $scope.gameStarted = true;
        // $scope.canPlay = (playerTurn === $scope.user.username);
        changePlayerTurn(playerTurn);
    });

    socket.on('turnEnded', function(turnResult) {
        // new msg dans le chat has hit or not
        changePlayerTurn(turnResult.turn);
        if (turnResult.hit)
            var displayMsg = $scope.playerTurn + ' has hit on position [' + turnResult.cell.posX + ',' + turnResult.cell.posY + '] !';
        else
            var displayMsg = $scope.playerTurn + ' missed on position [' + turnResult.cell.posX + ',' + turnResult.cell.posY + '] !';
        console.log(displayMsg);
        
    });

}