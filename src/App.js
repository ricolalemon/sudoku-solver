import React from 'react';
import SudokuSolver from './components/SudokuSolver';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          数独求解器
        </h1>
        <SudokuSolver />
      </div>
    </div>
  );
}

export default App;