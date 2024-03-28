function shuffleDeck(cards) {
    let shuffledCards = cards.slice();
    for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    return shuffledCards;
}

function initializeGame(cards) {
    const initialDeck = shuffleDeck(
        cards.filter((card) => ![1, 10, 91, 100].includes(card.id))
    );
    const player1InitialHand = initialDeck.slice(0, 5);
    const player2InitialHand = initialDeck.slice(5, 10);
    const remainingDeck = initialDeck.slice(10);

    games = {
        players: {
            player1: { hand: player1InitialHand, isTurn: true, socketId: null },
            player2: { hand: player2InitialHand, isTurn: false, socketId: null },
        },
        scores: {
            red: 0,
            blue: 0,
        },
        shuffledDeck: remainingDeck,
        protectedPatterns: {blue:[], red:[]},
    };
    return games;
}
function handleCardSelection(
    game,
    cardId,
    shuffledDeck,
    cards,
    currentTurn,
    selectedCard
) {
    let cardIndex = cardId - 1; // cardId starts from 1 and maps directly to the index by subtracting 1
    let currentPlayer = currentTurn === 'player1' ? 'player1' : 'player2';
    let nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    let playerHand = game.players[currentPlayer].hand;
    let cardInQuestion = cards[cardIndex];

    const isCardProtected = (cardId, protectedPatterns) => {
        return protectedPatterns[currentPlayer].includes(cardId) ||
               protectedPatterns[nextPlayer].includes(cardId);
    };


    if (selectedCard > 100 && selectedCard < 104) {
        cardInQuestion.selected = "True";
    }
    else if (selectedCard > 104 && selectedCard < 108 && cardInQuestion.selected === "True") {
        if (cardInQuestion.selected === "True" && !isCardProtected(cardId, game.protectedPatterns)) {
            cardInQuestion.selected = "False";
            cardInQuestion.selectedby = "";
        }
        else {
        cardInQuestion.selected = "True";
        }
    }
    else {
        cardInQuestion.selected = "True";
    }

    // Adjust color assignment based on the player
    if (!(selectedCard > 104 && selectedCard < 108 && cardInQuestion.selected === "True")) {
        if (currentPlayer == "player1") {
            cardInQuestion.selectedby = "blue";
        } else if (currentPlayer == "player2") {
            cardInQuestion.selectedby = "red";
        }
    }

    let indexToRemove = playerHand.findIndex(
        (card) => card.id === cardId || (selectedCard > 100 && selectedCard < 109 && card.id === selectedCard) || (card.matches && card.matches.includes(cardId))
    );
    playerHand.splice(indexToRemove, 1);
    if (shuffledDeck.length > 0) {
        let newCard = shuffledDeck.shift();
        playerHand.push(newCard);
    }

    game.players[currentPlayer].isTurn = false;
    game.players[nextPlayer].isTurn = true;
    game.players[currentPlayer].hand = playerHand;

    return (player = { game, shuffledDeck, cards, currentPlayer, nextPlayer, playerHand });
}

function Pattern(game, cards) {
    let board = Array(10).fill(null).map(() => Array(10).fill({ color: null, isPartOfPattern: false, index: -1 }));
    game.protectedPatterns = game.protectedPatterns || { blue: [], red: [] };
    const cornerIndices = [1, 10, 91, 100];

    const getPositionFromId = (id) => {
        let row = Math.floor((id - 1) / 10);
        let col = (id - 1) % 10;
        return { row, col };
    };

    if (Array.isArray(cards)){
    cards.forEach((card) => {
        if (card.selected === "True") {
            const { row, col } = getPositionFromId(card.id);
            board[row][col] = { color: card.selectedby, isPartOfPattern: false, index: card.id };
        }
    
    });
}
   
    const isCornerIndex = (index) => cornerIndices.includes(index);

    const checkConsecutive = (arr, color) => {
        let count = 0;
        let patternIndices = [];
        arr.forEach((cell) => {
            let effectiveColor = cell.color || (isCornerIndex(cell.index) ? color : null);
            if (effectiveColor === color) {
                count++;
                patternIndices.push(cell.index);
            } else {
                count = 0;
                patternIndices = [];
            }
        });

        let isPattern = count >= 5 && validateNewPatternWithProtected(color, patternIndices);
        return { isPattern, patternIndices: isPattern ? patternIndices : [] };
    };

    const validateNewPatternWithProtected = (color, newPatternIndices) => {
        let overlaps = game.protectedPatterns[color].map(pattern => 
            newPatternIndices.filter(index => pattern.includes(index)).length
        );
        return overlaps.every(count => count <= 1);
    };

    const isPatternNew = (color, patternIndices) => {
        const existingPatterns = game.protectedPatterns[color] || [];
        return !existingPatterns.some(pattern => patternIndices.every(index => pattern.includes(index)));
    };

    const addProtectedPattern = (color, pattern) => {
        game.protectedPatterns[color] = game.protectedPatterns[color] || [];
        game.protectedPatterns[color].push(pattern);
    };

    const checkDiagonalWin = (board, color) => {
        const getDownRightDiagonal = (startRow, startCol) => {
            let cells = [];
            for (let i = 0; startRow + i < 10 && startCol + i < 10; i++) {
                cells.push({ ...board[startRow + i][startCol + i], index: (startRow + i) * 10 + startCol + i + 1 }); // Adjusted index to match card IDs
            }
            return cells;
        };
    
        const getUpRightDiagonal = (startRow, startCol) => {
            let cells = [];
            for (let i = 0; startRow - i >= 0 && startCol + i < 10; i++) {
                cells.push({ ...board[startRow - i][startCol + i], index: (startRow - i) * 10 + startCol + i + 1 }); // Adjusted index to match card IDs
            }
            return cells;
        };
    
        let patternIndices = [];

        for (let row = 0; row <= 10 - 5; row++) {
            for (let col = 0; col <= 10 - 5; col++) {
                let diagonalCells = getDownRightDiagonal(row, col);
                let result = checkConsecutive(diagonalCells, color);
                if (result.isPattern) {
                    patternIndices = patternIndices.concat(result.patternIndices);
                }
            }
        }

        for (let row = 9; row >= 4; row--) {
            for (let col = 0; col <= 10 - 5; col++) {
                let diagonalCells = getUpRightDiagonal(row, col);
                let result = checkConsecutive(diagonalCells, color);
                if (result.isPattern) {
                    patternIndices = patternIndices.concat(result.patternIndices);
                }
            }
        }

        let isPattern = patternIndices.length > 0;
    
        return { isPattern, patternIndices };
    };
    

    const checkPatterns = (color) => {
        let winDetected = false;

        for (let i = 0; i < 10; i++) {
            let row = board[i].map((cell, index) => ({ ...cell, index: i * 10 + index + 1 }));
            let rowResult = checkConsecutive(row, color);
            if (rowResult.isPattern && validateNewPatternWithProtected(color, rowResult.patternIndices)) {
                if(isPatternNew(color, rowResult.patternIndices)){
                    winDetected = true;
                    addProtectedPattern(color, rowResult.patternIndices);
                    game.scores[color] += 1; // Increment score here for new horizontal patterns
                }
            }

            let col = board.map((_, rowIndex) => board[rowIndex][i]).map((cell, index) => ({ ...cell, index: index * 10 + i + 1 }));
            let colResult = checkConsecutive(col, color);
            if (colResult.isPattern && validateNewPatternWithProtected(color, colResult.patternIndices)) {
                if(isPatternNew(color, colResult.patternIndices)){
                    winDetected = true;
                    addProtectedPattern(color, colResult.patternIndices);
                    game.scores[color] += 1; // Increment score here for new vertical patterns
                }
            }
        }

        let diagResult = checkDiagonalWin(board,color);
        if (diagResult.isPattern && validateNewPatternWithProtected(color, diagResult.patternIndices)){
            if(isPatternNew(color, diagResult.patternIndices)){
                winDetected = true;
                addProtectedPattern(color, diagResult.patternIndices);
                game.scores[color] += 1;
            }
        } 

    };
    console.log(game.protectedPatterns);

    ["blue", "red"].forEach(color => checkPatterns(color));
    let winner = Object.keys(game?.scores || {}).find(color => game.scores[color] === 2) || null;
    return { winner, game };
}



function checkForWinner(cards,game) {
    let result = Pattern(cards, game);
    return result;
}

module.exports = {
    initializeGame,
    handleCardSelection,
    Pattern,
    checkForWinner,
};
