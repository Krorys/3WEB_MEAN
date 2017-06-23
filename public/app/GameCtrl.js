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
        $scope.selectedShip = undefined;
        $scope.checkShipsLeft();
    };

}