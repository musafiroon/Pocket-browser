import React, { useState } from 'react';

const Calculator: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const handleInput = (val: string) => {
        if (val === 'C') {
            setDisplay('0');
            setEquation('');
        } else if (val === '=') {
            try {
                // Safe eval alternative for simple math or strict regex
                // eslint-disable-next-line no-eval
                const res = eval(equation.replace(/×/g, '*').replace(/÷/g, '/'));
                const resultStr = String(res);
                setDisplay(resultStr);
                setEquation(resultStr);
            } catch {
                setDisplay('Error');
                setEquation('');
            }
        } else {
            const newEq = equation === '0' || equation === '' ? val : equation + val;
            setEquation(newEq);
            setDisplay(newEq);
        }
    };

    const btns = [
        'C', '(', ')', '÷',
        '7', '8', '9', '×',
        '4', '5', '6', '-',
        '1', '2', '3', '+',
        '0', '.', '=',
    ];

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="w-full max-w-sm bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
                <div className="mb-4 p-4 bg-gray-900 rounded-xl text-right overflow-hidden">
                    <div className="text-3xl font-mono text-white truncate">{display}</div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {btns.map((btn, i) => (
                        <button
                            key={i}
                            onClick={() => handleInput(btn)}
                            className={`p-4 rounded-xl font-bold text-lg active:scale-95 transition-transform ${
                                btn === '=' ? 'bg-blue-600 text-white col-span-2' : 
                                ['C', '(', ')', '÷', '×', '-', '+'].includes(btn) ? 'bg-gray-700 text-blue-300' : 'bg-gray-900 text-white hover:bg-gray-700'
                            }`}
                        >
                            {btn}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Calculator;