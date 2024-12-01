import React from 'react';
import SudokuSolver from './components/SudokuSolver';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <SudokuSolver />
      </div>
    </div>
  );
}

export default App;