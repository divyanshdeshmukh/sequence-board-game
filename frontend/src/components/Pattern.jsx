// Pattern.jsx
import React, { useEffect } from 'react';

const Pattern = ({ cards,updateScore,checkGoalReached }) => {
  useEffect(() => {
        // Function to initialize the board with corner cases set to true
        const board = Array(10).fill(null).map(() => Array(10).fill(false));
        // Set corners as true according to your game's rules
        board[0][0] = true;
        board[0][9] = true;
        board[9][0] = true;
        board[9][9] = true;


        // Function to calculate position from card ID
        const getPositionFromId = (id) => {
            let row = Math.floor((id - 1) / 10);
            let col = (id - 1) % 10;
            return [row, col];
        };


        // Convert card id to board position and update the board for selected cards
        cards.forEach(card => {
        if (card.selected) {
            const [row, col] = getPositionFromId(card.id);
            board[row][col] = true;
        }
        });

        function checkWin(board) {
            // Function to check for consecutive true values in an array
            const checkConsecutive = (arr) => {
                let count = 0;
                for (let value of arr) {
                    if (value) {
                        count++;
                        if (count >= 5) return true;
                    } else {
                        count = 0; // Reset count if a false value is found
                    }
                }
                return false;
            };
        
            // Check rows and columns for win
            for (let i = 0; i < board.length; i++) {
                if (checkConsecutive(board[i])) return true; // Horizontal check
                if (checkConsecutive(board.map(row => row[i]))) return true; // Vertical check
            }
        
            // Check diagonal lines for win
            for (let row = 0; row <= 5; row++) {
                for (let col = 0; col <= 5; col++) {
                    // Diagonal down-right check
                    if (new Array(5).fill(null).every((_, idx) => row + idx < 10 && col + idx < 10 && board[row + idx][col + idx])) {
                        return true;
                    }
                    // Diagonal up-right check
                    if (new Array(5).fill(null).every((_, idx) => row - idx >= 0 && col + idx < 10 && board[row - idx][col + idx])) {
                        return true;
                    }
                }
            }
            return false; // No win condition met
        }
    
        if (checkWin(board)) {
            updateScore('red');
            checkGoalReached();
        }
    
    }, [cards]); // Dependency array ensures this effect runs whenever `cards` changes

  return null; // This component doesn't need to render anything
  
};

export default Pattern;
