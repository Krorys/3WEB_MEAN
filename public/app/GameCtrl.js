angular.module('bsApp')
.controller('GameCtrl', GameCtrl);

function GameCtrl($scope, $rootScope, $http, socket) {
    
    var boardLength = 9;
    $scope.board = [];
    for (var i = 0; i < boardLength; i++) {
        $scope.board.push([]);
        for (var j = 0; j < boardLength; j++) {
            var cell = {
                posX: i,
                posY: j,
                state: '', // used || alive || destroyed
                hoverState: ''
            };
            $scope.board[i].push(cell);
        }
    }
    // console.log($scope.board);

    $scope.shipsAvailable = {
        carriers: {
            name: 'Carrier',
            size: 5,
            nb: 1,
            color: 'lime'
        },
        battleships: {
            name: 'Battleship',
            size: 4,
            nb: 2,
            color: 'mediumorchid'
        },
        submarines: {
            name: 'Submarine',
            size: 3,
            nb: 1,
            color: 'coral'
        },  
        destroyers: {
            name: 'Destroyer',
            size: 2,
            nb: 3,
            color: 'royalblue'
        }
    };

    $scope.shipsPlaced = [];

    $scope.pickShip = function(ship) {
        $scope.selectedShip = ship;
    };

    $scope.swapOrientation = function() {
        $scope.isOrientationVertical = ! $scope.isOrientationVertical;
    };

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
            element.shipEnd = (i + 1 == $scope.selectedCells.length ? true : false);
            newShip.cells.push(element);
        }

        $scope.selectedCells = [];
        $scope.shipsPlaced.push(newShip);
        $scope.selectedShip.nb--;
        $scope.selectedShip = undefined;
    };

}