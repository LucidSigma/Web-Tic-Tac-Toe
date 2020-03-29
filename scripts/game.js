const ROW_SIZE = 3;
const COLUMN_SIZE = 3;

const PLAYER = "o";
const COMPUTER = "x";
const EMPTY_CELL = " ";

let board = [];
let remainingIndices = [];

let gameOver = false;
const resultText = $("#resultText");

const COMPUTER_FUNCTION_LOOKUP = {
	easy: playEasyComputerTurn,
	medium: playMediumComputerTurn,
	hard: playHardComputerTurn
};

let currentMode = "medium";

$(document).ready(() => {
	for (let i = 0; i < ROW_SIZE * COLUMN_SIZE; ++i) {
		$("div.container").append("<div class=\"cell\"></div>");
	}

	newGame();

	$("div.cell").click(function() {
		processInput($(this));
	});

	$("#newGameButton").click(() => {
		newGame();
	});

	$(".difficulty-button").click(function() {
		$(".difficulty-button").removeClass("selected-button");
		$(this).addClass("selected-button");

		currentMode = $(this).text().toLowerCase();

		newGame();
	});
});

function newGame() {
	$("div.cell").removeClass(PLAYER).removeClass(COMPUTER);

	board = [];
	remainingIndices = [];

	for (let i = 0; i < ROW_SIZE * COLUMN_SIZE; ++i) {
		board.push(EMPTY_CELL);
		remainingIndices.push(i);
	}

	gameOver = false;
	resultText.text("Get three in a row to win!");
}

function processInput(cell) {
	if (!gameOver && board[cell.index()] === EMPTY_CELL) {
		placePiece(PLAYER, cell.index());

		if (checkWin()) {
			gameOver = true;
			resultText.text("You have won!");
		}
		else if (checkDraw()) {
			gameOver = true;
			resultText.text("It is a draw!");
		}
		else {
			COMPUTER_FUNCTION_LOOKUP[currentMode]();
		}
	}
}

function playEasyComputerTurn() {
	const computerChoice = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
	placePiece(COMPUTER, computerChoice);

	finishComputerTurn();
}

function playMediumComputerTurn() {
	let foundMove = false;

	// Check if computer is about to win.
	for (const remainingIndex of remainingIndices) {
		board[remainingIndex] = COMPUTER;

		if (checkWin()) {
			placePiece(COMPUTER, remainingIndex);
			foundMove = true;

			break;
		}
		else {
			board[remainingIndex] = EMPTY_CELL;
		}
	}

	if (!foundMove) {
		foundMove = false;

		// Check if player is about to win and block them from doing so.
		for (const remainingIndex of remainingIndices) {
			board[remainingIndex] = PLAYER;
	
			if (checkWin()) {
				placePiece(COMPUTER, remainingIndex);
				foundMove = true;
	
				break;
			}
			else {
				board[remainingIndex] = EMPTY_CELL;
			}
		}
	}

	if (!foundMove)	{
		// Computer or player cannot win on the next turn, select a remaining square based on how effective they are.
		const BEST_MOVES = [4, 0, 2, 6, 8, 1, 3, 5, 7];

		for (const bestMove of BEST_MOVES) {
			if (remainingIndices.indexOf(bestMove) !== -1) {
				placePiece(COMPUTER, bestMove);

				break;
			}
		}
	}

	finishComputerTurn();
}

function playHardComputerTurn() {
	let bestScore = -Infinity;
	let bestMoveIndex = null;

	for (let i = 0; i < board.length; ++i) {
		if (board[i] === EMPTY_CELL) {
			board[i] = COMPUTER;
			const score = getMinimaxScore(false);
			board[i] = EMPTY_CELL;
	
			if (score > bestScore) {
				bestScore = score;
				bestMoveIndex = i;
			}
		}
	}

	placePiece(COMPUTER, bestMoveIndex);
	finishComputerTurn();
}

function getMinimaxScore(isComputersTurn) {
	const gameResult = checkWin();

	if (gameResult === COMPUTER) {
		return 1;
	}
	else if (gameResult === PLAYER) {
		return -1;
	}
	else if (checkDraw()) {
		return 0;
	}

	let bestScore = Infinity;

	if (isComputersTurn) {
		bestScore *= -1;
	}

	for (let i = 0; i < board.length; ++i) {
		if (board[i] === EMPTY_CELL) {
			board[i] = isComputersTurn ? COMPUTER : PLAYER;
			const score = getMinimaxScore(!isComputersTurn);
			board[i] = EMPTY_CELL;

			bestScore = (isComputersTurn ? Math.max : Math.min)(bestScore, score);
		}
	}

	return bestScore;
}

function checkDraw() {
	for (const cell of board) {
		if (cell === EMPTY_CELL) {
			return false;
		}
	}

	return true;
}

function placePiece(piece, index) {
	$(`div.cell:nth-of-type(${index + 1})`).addClass(piece);
	
	board[index] = piece;
	remainingIndices.splice(remainingIndices.indexOf(index), 1);
}

function finishComputerTurn() {
	if (checkWin()) {
		gameOver = true;
		resultText.text("You have lost!");
	}
}

function checkWin() {
	for (let i = 0; i < ROW_SIZE; ++i) {
		if (board[i * ROW_SIZE] === board[1 + i * ROW_SIZE] && board[i * ROW_SIZE] === board[2 + i * ROW_SIZE] && board[i * ROW_SIZE] !== EMPTY_CELL) {
			return board[i * ROW_SIZE];
		}

		if (board[i] === board[COLUMN_SIZE + i] && board[i] === board[COLUMN_SIZE * 2 + i] && board[i] !== EMPTY_CELL) {
			return board[i];
		}
	}

	if (board[0] === board[4] && board[0] === board[8] && board[0] !== EMPTY_CELL) {
		return board[0];
	}

	if (board[2] === board[4] && board[2] === board[6] && board[2] !== EMPTY_CELL) {
		return board[2];
	}

	return false;
}