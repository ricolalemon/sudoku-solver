import React, { useState } from 'react';

const SudokuSolver = () => {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill('')));
  const [originalBoard, setOriginalBoard] = useState(Array(9).fill().map(() => Array(9).fill(false)));
  const [solving, setSolving] = useState(false);
  const [currentTry, setCurrentTry] = useState({ row: -1, col: -1, num: '' });
  const [solveMode, setSolveMode] = useState('normal'); // 'fast', 'normal', 'relax'
  const [selectedCell, setSelectedCell] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showTimeCard, setShowTimeCard] = useState(false);
  const [timeCardDate, setTimeCardDate] = useState('');
  const [timeJumpStatus, setTimeJumpStatus] = useState('idle'); // 'idle', 'jumping', 'success'

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const checkTimeCode = () => {
    // 检查每个3x3宫格是否包含特定数字
    const hasNumberInBox = (boxRow, boxCol, number) => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = boxRow * 3 + i;
          const col = boxCol * 3 + j;
          if (board[row][col] === number.toString()) {
            return true;
          }
        }
      }
      return false;
    };

    // 检查三个不同的日期码
    const datePatterns = [
      {
        boxes: [
          { box: [0, 0], value: '2' },  // 第一个宫格找2
          { box: [0, 1], value: '' },   // 第二个宫格空着
          { box: [0, 2], value: '2' },  // 第三个宫格找2
          { box: [1, 0], value: '4' },  // 第四个宫格找4
          { box: [1, 1], value: '1' },  // 第五个宫格找1
          { box: [1, 2], value: '' },   // 第六个宫格空着
          { box: [2, 0], value: '1' },  // 第七个宫格找1
          { box: [2, 1], value: '2' }   // 第八个宫格找2
        ],
        date: '2024年10月12日'
      },
      {
        boxes: [
          { box: [0, 0], value: '2' },
          { box: [0, 1], value: '' },
          { box: [0, 2], value: '2' },
          { box: [1, 0], value: '4' },
          { box: [1, 1], value: '1' },
          { box: [1, 2], value: '' },
          { box: [2, 0], value: '0' },
          { box: [2, 1], value: '3' }
        ],
        date: '2024年10月3日'
      },
      {
        boxes: [
          { box: [0, 0], value: '2' },
          { box: [0, 1], value: '' },
          { box: [0, 2], value: '2' },
          { box: [1, 0], value: '4' },
          { box: [1, 1], value: '1' },
          { box: [1, 2], value: '1' },
          { box: [2, 0], value: '0' },
          { box: [2, 1], value: '9' }
        ],
        date: '2024年11月9日'
      }
    ];

    // 检查每种模式
    for (const { boxes, date } of datePatterns) {
      if (boxes.every(({box, value}) => 
        value === '' || hasNumberInBox(box[0], box[1], value)
      )) {
        setTimeCardDate(date);
        setTimeJumpStatus('success'); // 设置为跳跃成功
        return true;
      }
    }

    return false;
  };

  const isValidInput = (value) => {
    if (value === '') return true;
    const num = parseInt(value);
    return !isNaN(num) && num >= 1 && num <= 9;
  };

  const handleKeyboardInput = (value) => {
    if (!selectedCell || solving) return;
    const { row, col } = selectedCell;
    handleChange(row, col, value);
  };

  const handleChange = (row, col, value) => {
    if (!isValidInput(value)) return;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = value;
    setBoard(newBoard);
    
    // 移除以下行，因为我们现在在求解时检查彩蛋
    // checkTimeCode(); 
    
    if (value !== '') {
      const newOriginalBoard = originalBoard.map(r => [...r]);
      newOriginalBoard[row][col] = true;
      setOriginalBoard(newOriginalBoard);
    } else {
      const newOriginalBoard = originalBoard.map(r => [...r]);
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

  const animatedSolve = async (board, delayTime) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === '') {
          for (let num = 1; num <= 9; num++) {
            setCurrentTry({ row, col, num: num.toString() });
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
          setCurrentTry({ row: -1, col: -1, num: '' });
          return false;
        }
      }
    }
    return true;
  };

  const solveSudoku = async () => {
    if (solving) return; // 防止重复点击

    setSolving(true);
    setSelectedCell(null);
    setCurrentTry({ row: -1, col: -1, num: '' });

    // 仅在“Rei模式”下触发彩蛋
    if (solveMode === 'relax') {
      // 立即显示时间跳跃装置卡片并设置状态为“正在跳跃...”
      setShowTimeCard(true);
      setTimeJumpStatus('jumping');

      // 设置三秒后检查并显示跳跃成功的信息
      setTimeout(() => {
        const matched = checkTimeCode();
        if (matched) {
          setTimeJumpStatus('success');
        } else {
          // 如果不匹配，可以选择隐藏卡片或显示其他信息
          setShowTimeCard(false);
        }
      }, 3000);
    }

    const newBoard = board.map(r => [...r]);

    if (solveMode === 'fast') {
      if (fastSolve(newBoard)) {
        setBoard([...newBoard]);
      }
    } else {
      const delayTime = solveMode === 'normal' ? 10 : 50;
      await animatedSolve(newBoard, delayTime);
    }

    setCurrentTry({ row: -1, col: -1, num: '' });
    setSolving(false);
  };

  const clearBoard = () => {
    setBoard(Array(9).fill().map(() => Array(9).fill('')));
    setOriginalBoard(Array(9).fill().map(() => Array(9).fill(false)));
    setCurrentTry({ row: -1, col: -1, num: '' });
    setSelectedCell(null);
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
    setSelectedCell(null);
  };

  const getCellClassName = (row, col) => {
    const classes = [
      'w-10', 'h-10', 'text-center', 'outline-none', 'font-semibold',
      'transition-all duration-200 ease-in-out'
    ];
    
    if (row === 0) classes.push('border-t-2');
    if (row === 8) classes.push('border-b-2');
    if (col === 0) classes.push('border-l-2');
    if (col === 8) classes.push('border-r-2');
    if (row % 3 === 2 && row !== 8) classes.push('border-b-2');
    if (col % 3 === 2 && col !== 8) classes.push('border-r-2');
    if (row % 3 !== 2 && row !== 8) classes.push('border-b');
    if (col % 3 !== 2 && col !== 8) classes.push('border-r');

    if (currentTry.row === row && currentTry.col === col) {
      classes.push('bg-yellow-100');
      if (currentTry.num !== '') {
        classes.push('text-red-500');
      }
    } else if (selectedCell?.row === row && selectedCell?.col === col) {
      classes.push('bg-blue-100');
    } else if ((Math.floor(row/3) + Math.floor(col/3)) % 2 === 0) {
      classes.push('bg-white');
    } else {
      classes.push('bg-gray-50');
    }

    if (originalBoard[row][col]) {
      classes.push('text-black');
    } else if (board[row][col] !== '') {
      if (currentTry.row === row && currentTry.col === col) {
        // 不添加动画，因为这里是正在尝试的数字
      } else {
        classes.push('text-blue-600');
        if (solveMode !== 'fast') {
          classes.push('animate-pop-in');
        }
      }
    }

    if (solving) {
      classes.push('cursor-not-allowed');
    }

    return classes.join(' ');
  };

  const getKeyboardButtonClass = (num) => {
    return `w-12 h-12 text-xl font-bold rounded-lg transition-all duration-200
            ${solving ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:bg-blue-100 active:bg-blue-200'}
            border-2 border-gray-300 shadow-md`;
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">数独求解器</h1>
        <p className="text-gray-600 italic">Dedicated to Yui, who loves solving Sudoku puzzles</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
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
            @keyframes fade-in {
              0% { opacity: 0; transform: scale(0.9); }
              100% { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in {
              animation: fade-in 0.5s ease-out forwards;
            }
          `}
        </style>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-200"
          >
            {showKeyboard ? '隐藏虚拟键盘' : '显示虚拟键盘'}
          </button>
        </div>

        <div className="grid grid-cols-9 border-2 border-gray-400 rounded-lg overflow-hidden">
          {board.map((row, i) => (
            row.map((cell, j) => (
              <input
                key={`${i}-${j}`}
                type="text"
                value={currentTry.row === i && currentTry.col === j && currentTry.num ? currentTry.num : cell}
                onChange={(e) => handleChange(i, j, e.target.value)}
                onClick={() => !solving && setSelectedCell({ row: i, col: j })}
                className={getCellClassName(i, j)}
                disabled={solving}
                maxLength={1}
                readOnly={showKeyboard}
              />
            ))
          ))}
        </div>

        {showKeyboard && (
          <div className="mt-6 grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleKeyboardInput(num.toString())}
                disabled={solving}
                className={getKeyboardButtonClass(num)}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleKeyboardInput('')}
              disabled={solving}
              className={getKeyboardButtonClass('clear') + ' col-span-3'}
            >
              清除
            </button>
          </div>
        )}
        
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
              Rei模式
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

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Made with ❤️ for Yui</p>
        </div>
      </div>

      {/* 时间跳跃装置卡片 */}
      {showTimeCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl transform transition-all duration-500 animate-fade-in">
            <div className="text-center">
              {/* 更改标题为“时间跳跃装置” */}
              <div className="mb-4 text-4xl font-bold text-gray-800">时间跳跃装置</div>
              <div className="mb-6">
                {timeJumpStatus === 'jumping' ? (
                  <p className="text-lg text-gray-600">正在跳跃...</p>
                ) : (
                  <p className="text-lg text-gray-600">时间跳跃成功，现在是：{timeCardDate}，请和Rei确认</p>
                )}
              </div>
              <button
                onClick={() => setShowTimeCard(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SudokuSolver;
