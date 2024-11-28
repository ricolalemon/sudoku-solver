import React, { useState } from 'react';

const SudokuSolver = () => {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill('')));
  const [originalBoard, setOriginalBoard] = useState(Array(9).fill().map(() => Array(9).fill(false)));
  const [solving, setSolving] = useState(false);
  const [currentTry, setCurrentTry] = useState({ row: -1, col: -1 });
  const [solveMode, setSolveMode] = useState('normal'); // 'fast', 'normal', 'relax'

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const isValidInput = (value) => {
    if (value === '') return true;
    const num = parseInt(value);
    return !isNaN(num) && num >= 1 && num <= 9;
  };

  const handleChange = (row, col, value) => {
    if (!isValidInput(value)) return;
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = value;
    setBoard(newBoard);
    
    if (value !== '') {
      const newOriginalBoard = originalBoard.map(row => [...row]);
      newOriginalBoard[row][col] = true;
      setOriginalBoard(newOriginalBoard);
    } else {
      const newOriginalBoard = originalBoard.map(row => [...row]);
      newOriginalBoard[row][col] = false;
      setOriginalBoard(newOriginalBoard);
    }
  };

  const isValid = (board, row, col, num) => {
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }
    
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }
    
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  };

  // 快速求解，没有动画
  const fastSolve = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === '') {
          for (let num = 1; num <= 9; num++) {
            const numStr = num.toString();
            if (isValid(board, row, col, numStr)) {
              board[row][col] = numStr;
              if (fastSolve(board)) {
                return true;
              }
              board[row][col] = '';
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  // 带动画的求解
  const animatedSolve = async (board, delayTime) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === '') {
          for (let num = 1; num <= 9; num++) {
            setCurrentTry({ row, col });
            await delay(delayTime);

            const numStr = num.toString();
            if (isValid(board, row, col, numStr)) {
              board[row][col] = numStr;
              setBoard([...board]);

              if (await animatedSolve(board, delayTime)) {
                return true;
              }
              
              board[row][col] = '';
              setBoard([...board]);
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const solveSudoku = async () => {
    setSolving(true);
    const newBoard = board.map(row => [...row]);

    if (solveMode === 'fast') {
      // 快速模式：直接求解，无动画
      if (fastSolve(newBoard)) {
        setBoard([...newBoard]);
      }
    } else {
      // 普通模式和解压模式：带动画效果
      const delayTime = solveMode === 'normal' ? 10 : 50;
      await animatedSolve(newBoard, delayTime);
    }

    setCurrentTry({ row: -1, col: -1 });
    setSolving(false);
  };

  const clearBoard = () => {
    setBoard(Array(9).fill().map(() => Array(9).fill('')));
    setOriginalBoard(Array(9).fill().map(() => Array(9).fill(false)));
    setCurrentTry({ row: -1, col: -1 });
  };

  const loadExample = () => {
    const example = [
      ['5','3','','','7','','','',''],
      ['6','','','1','9','5','','',''],
      ['','9','8','','','','','6',''],
      ['8','','','','6','','','','3'],
      ['4','','','8','','3','','','1'],
      ['7','','','','2','','','','6'],
      ['','6','','','','','2','8',''],
      ['','','','4','1','9','','','5'],
      ['','','','','8','','','7','9']
    ];
    setBoard(example);
    
    const newOriginalBoard = Array(9).fill().map(() => Array(9).fill(false));
    example.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell !== '') {
          newOriginalBoard[i][j] = true;
        }
      });
    });
    setOriginalBoard(newOriginalBoard);
  };

  const getCellClassName = (row, col) => {
    const classes = [
      'w-10', 'h-10', 'text-center', 'outline-none', 'font-semibold',
      'transition-all duration-200 ease-in-out'
    ];
    
    // 边框样式
    if (row === 0) classes.push('border-t-2');
    if (row === 8) classes.push('border-b-2');
    if (col === 0) classes.push('border-l-2');
    if (col === 8) classes.push('border-r-2');
    if (row % 3 === 2 && row !== 8) classes.push('border-b-2');
    if (col % 3 === 2 && col !== 8) classes.push('border-r-2');
    if (row % 3 !== 2 && row !== 8) classes.push('border-b');
    if (col % 3 !== 2 && col !== 8) classes.push('border-r');

    // 背景样式
    if (currentTry.row === row && currentTry.col === col) {
      classes.push('bg-yellow-100');
    } else if ((Math.floor(row/3) + Math.floor(col/3)) % 2 === 0) {
      classes.push('bg-white');
    } else {
      classes.push('bg-gray-50');
    }

    // 文字样式
    if (originalBoard[row][col]) {
      classes.push('text-black'); // 原始数字为黑色
    } else if (board[row][col] !== '') {
      classes.push('text-blue-600'); // 填入数字为蓝色
      if (solveMode !== 'fast') {
        classes.push('animate-pop-in');
      }
    }

    if (solving) {
      classes.push('cursor-not-allowed');
    }

    return classes.join(' ');
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6">
      <style>
        {`
          @keyframes pop-in {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-pop-in {
            animation: pop-in 0.3s ease-out forwards;
          }
        `}
      </style>
      <div className="grid grid-cols-9 border-2 border-gray-400 rounded-lg overflow-hidden">
        {board.map((row, i) => (
          row.map((cell, j) => (
            <input
              key={`${i}-${j}`}
              type="text"
              value={cell}
              onChange={(e) => handleChange(i, j, e.target.value)}
              className={getCellClassName(i, j)}
              disabled={solving}
              maxLength={1}
            />
          ))
        ))}
      </div>
      
      <div className="flex flex-col items-center gap-4 mt-6">
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setSolveMode('fast')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 
                     ${solveMode === 'fast' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            快速模式
          </button>
          <button
            onClick={() => setSolveMode('normal')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 
                     ${solveMode === 'normal' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            普通模式
          </button>
          <button
            onClick={() => setSolveMode('relax')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 
                     ${solveMode === 'relax' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            解压模式
          </button>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={solveSudoku}
            disabled={solving}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                     hover:from-blue-600 hover:to-blue-700 transition-all duration-200 
                     shadow-lg disabled:opacity-50 font-semibold"
          >
            {solving ? '求解中...' : '求解'}
          </button>
          <button
            onClick={clearBoard}
            disabled={solving}
            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg 
                     hover:from-gray-600 hover:to-gray-700 transition-all duration-200 
                     shadow-lg disabled:opacity-50 font-semibold"
          >
            清空
          </button>
          <button
            onClick={loadExample}
            disabled={solving}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg 
                     hover:from-green-600 hover:to-green-700 transition-all duration-200 
                     shadow-lg disabled:opacity-50 font-semibold"
          >
            示例
          </button>
        </div>
      </div>
    </div>
  );
};

export default SudokuSolver;