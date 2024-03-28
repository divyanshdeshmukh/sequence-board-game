const gameController = require('./controllers/gameController'); 

// //for row
// let cards = [
//     { id: 2, selected: "True", selectedby: "blue" },
//     { id: 3, selected: "True", selectedby: "blue" },
//     { id: 4, selected: "True", selectedby: "blue" },
//     { id: 5, selected: "True", selectedby: "blue" },
// ];
// let game = gameController.initializeGame(cards);
// let result = gameController.Pattern(game, cards);
// let additonal=[
// { id: 6, selected: "True", selectedby: "blue" },
// { id: 7, selected: "True", selectedby: "blue" },
// { id: 8, selected: "True", selectedby: "blue" },
// { id: 9, selected: "True", selectedby: "blue" },
// ];
// cards.push(...additonal);
// console.log(result.game.protectedPatterns);

// For column
// let columnCards = [
//     { id: 11, selected: "True", selectedby: "blue" },
//     { id: 21, selected: "True", selectedby: "blue" },
//     { id: 31, selected: "True", selectedby: "blue" },
//     { id: 41, selected: "True", selectedby: "blue" },
// ];
// let gameCol = gameController.initializeGame(columnCards);
// let resultCol = gameController.Pattern(gameCol, columnCards);
// console.log(resultCol.game.protectedPatterns);
// let additionalCol = [
//     { id: 51, selected: "True", selectedby: "blue" },
//     { id: 61, selected: "True", selectedby: "blue" },
//     { id: 71, selected: "True", selectedby: "blue" },
//     { id: 81, selected: "True", selectedby: "blue" },
// ];
// columnCards.push(...additionalCol);
// let resultCol1 = gameController.Pattern(gameCol, columnCards);
// console.log(resultCol1.game.protectedPatterns);

//Down-right diagonal
let diagonalDownRightCards = [
    { id: 3, selected: "True", selectedby: "blue" },
    { id: 14, selected: "True", selectedby: "blue" },
    { id: 25, selected: "True", selectedby: "blue" },
    { id: 36, selected: "True", selectedby: "blue" },
    { id: 47, selected: "True", selectedby: "blue" },
    { id: 58, selected: "True", selectedby: "blue" },
];
let gameDiagonalDR = gameController.initializeGame(diagonalDownRightCards);
let resultDiagonalDR = gameController.Pattern(gameDiagonalDR, diagonalDownRightCards);
console.log(resultDiagonalDR.game.protectedPatterns);
// let additionalDiagonalDR = [
//     { id: 56, selected: "True", selectedby: "blue" },
//     { id: 67, selected: "True", selectedby: "blue" },
//     { id: 78, selected: "True", selectedby: "blue" },
//     {id: 89, selected: "True", selectedby: "blue" }
// ];
// diagonalDownRightCards.push(...additionalDiagonalDR);
// let resultDiagonalDR2 = gameController.Pattern(gameDiagonalDR, diagonalDownRightCards);
// console.log(resultDiagonalDR2.game.protectedPatterns);

// Up-right diagonal
// let diagonalUpRightCards = [
//     { id: 82, selected: "True", selectedby: "blue" },
//     { id: 73, selected: "True", selectedby: "blue" },
//     { id: 64, selected: "True", selectedby: "blue" },
//     { id: 55, selected: "True", selectedby: "blue" },
// ];
// let gameDiagonalUR = gameController.initializeGame(diagonalUpRightCards);
// let resultDiagonalUR = gameController.Pattern(gameDiagonalUR, diagonalUpRightCards);
// console.log(resultDiagonalUR.game.protectedPatterns);
// let additionalDiagonalUR = [
//     { id: 46, selected: "True", selectedby: "blue" },
//     { id: 37, selected: "True", selectedby: "blue" },
//     { id: 28, selected: "True", selectedby: "blue" },
//     { id: 19, selected: "True", selectedby: "blue" },
// ];
// diagonalUpRightCards.push(...additionalDiagonalUR);
// let resultDiagonalUR2 = gameController.Pattern(gameDiagonalUR, diagonalUpRightCards);
// console.log(resultDiagonalUR2.game.protectedPatterns);