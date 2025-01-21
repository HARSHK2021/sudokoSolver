import React, { useState, useCallback, useEffect } from 'react';
import { Undo2, Redo2, RefreshCw, HelpCircle, Plus, Pencil, Play } from 'lucide-react';
import { generateSudoku, solveSudoku } from './utils/sudoku';

interface StoredState {
  board: number[][];
  history: number[][][];
  currentStep: number;
  isCustomMode: boolean;
  timestamp: number;
}

function App() {
  const [board, setBoard] = useState<number[][]>([]);
  const [history, setHistory] = useState<number[][][]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  useEffect(() => {
    const loadSavedState = () => {
      const savedState = localStorage.getItem('sudokuState');
      if (savedState) {
        const parsedState: StoredState = JSON.parse(savedState);
        const now = Date.now();
        // Check if the saved state is less than 24 hours old
        if (now - parsedState.timestamp < 24 * 60 * 60 * 1000) {
          setBoard(parsedState.board);
          setHistory(parsedState.history);
          setCurrentStep(parsedState.currentStep);
          setIsCustomMode(parsedState.isCustomMode);
          return true;
        } else {
          localStorage.removeItem('sudokuState');
        }
      }
      return false;
    };

    if (!loadSavedState()) {
      newGame();
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (board.length > 0) {
      const stateToSave: StoredState = {
        board,
        history,
        currentStep,
        isCustomMode,
        timestamp: Date.now()
      };
      localStorage.setItem('sudokuState', JSON.stringify(stateToSave));
    }
  }, [board, history, currentStep, isCustomMode]);

  const newGame = useCallback(() => {
    const newBoard = generateSudoku();
    setBoard(newBoard);
    setHistory([newBoard.map(row => [...row])]);
    setCurrentStep(0);
    setIsCustomMode(false);
  }, []);

  const startCustomGame = useCallback(() => {
    const emptyBoard = Array(9).fill(0).map(() => Array(9).fill(0));
    setBoard(emptyBoard);
    setHistory([emptyBoard.map(row => [...row])]);
    setCurrentStep(0);
    setIsCustomMode(true);
  }, []);

  const updateCell = useCallback((row: number, col: number, value: number) => {
    if (value < 0 || value > 9) return;
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = value;
    
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push(newBoard.map(r => [...r]));
    
    setBoard(newBoard);
    setHistory(newHistory);
    setCurrentStep(currentStep + 1);
  }, [board, history, currentStep]);

  const undo = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setBoard(history[currentStep - 1].map(row => [...row]));
    }
  }, [currentStep, history]);

  const redo = useCallback(() => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
      setBoard(history[currentStep + 1].map(row => [...row]));
    }
  }, [currentStep, history]);

  const solve = useCallback(() => {
    const solution = board.map(row => [...row]);
    if (solveSudoku(solution)) {
      setBoard(solution);
      const newHistory = [...history, solution];
      setHistory(newHistory);
      setCurrentStep(newHistory.length - 1);
    } else {
      alert('No solution exists for this puzzle. Please check your input.');
    }
  }, [board, history]);

  const reset = useCallback(() => {
    if (history.length > 0) {
      setBoard(history[0].map(row => [...row]));
      setCurrentStep(0);
    }
  }, [history]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-sky-200 animate-gradient py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 text-white tracking-tight">
            Sudoku<span className="text-blue-900">Solver</span>
          </h1>
          <p className="text-blue-900/90 text-lg font-medium">Fill in the numbers or generate a new puzzle</p>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
          <div className="grid grid-cols-9 gap-0.5 bg-gray-300 p-0.5 rounded-xl overflow-hidden">
            {board.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <input
                  key={`${rowIndex}-${colIndex}`}
                  type="number"
                  min="1"
                  max="9"
                  value={cell || ''}
                  onChange={(e) => updateCell(rowIndex, colIndex, parseInt(e.target.value) || 0)}
                  className={`w-full aspect-square text-center text-lg font-semibold border-0
                    ${(Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 === 0
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'bg-white hover:bg-blue-50'
                    }
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
                    ${cell ? 'text-blue-700' : 'text-gray-600'}`}
                />
              ))
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={startCustomGame}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                isCustomMode 
                  ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/30'
              }`}
            >
              <Pencil size={20} /> Custom Mode
            </button>
            <button
              onClick={newGame}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                !isCustomMode
                  ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/30'
              }`}
            >
              <Plus size={20} /> Generated Mode
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={undo}
              disabled={currentStep <= 0}
              className="flex items-center justify-center gap-2 bg-white/90 text-gray-700 px-4 py-3 rounded-xl hover:bg-white disabled:opacity-50 disabled:hover:bg-white/90 transition-all duration-200 shadow-lg"
            >
              <Undo2 size={20} /> Undo
            </button>
            <button
              onClick={redo}
              disabled={currentStep >= history.length - 1}
              className="flex items-center justify-center gap-2 bg-white/90 text-gray-700 px-4 py-3 rounded-xl hover:bg-white disabled:opacity-50 disabled:hover:bg-white/90 transition-all duration-200 shadow-lg"
            >
              <Redo2 size={20} /> Redo
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-white/90 text-blue-600 px-4 py-3 rounded-xl hover:bg-white transition-all duration-200 shadow-lg"
            >
              <RefreshCw size={20} /> Reset
            </button>
          </div>

          <button
            onClick={solve}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-sky-500 text-white px-6 py-4 rounded-xl hover:from-blue-500 hover:to-sky-600 transition-all duration-300 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
          >
            {isCustomMode ? <Play size={24} /> : <HelpCircle size={24} />}
            {isCustomMode ? 'Solve Custom Puzzle' : 'Help (Solve)'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;