'use client';
import React from 'react';
import { motion } from 'motion/react';

interface LabeledSwitchProps {
  state: 'left' | 'right';
  onChange?: (state: 'left' | 'right') => void;
  leftLabel: string;
  rightLabel: string;
}

function LabeledSwitch({ state, onChange, leftLabel, rightLabel }: LabeledSwitchProps) {
  return (
    <div className="border-shine-1 mx-auto rounded-full p-1 text-sm">
      <motion.div className="relative grid h-full grid-cols-2">
        <motion.div
          className="bg-mauveine-500 border-shine-1 absolute top-0 left-0 z-0 h-full w-1/2 rounded-full transition-all ease-in-out"
          style={{ x: state === 'left' ? '0%' : '100%' }}
        />
        <button
          className="relative flex min-w-32.5 cursor-pointer items-center justify-center px-3 py-2 text-center"
          onClick={() => onChange?.('left')}>
          {leftLabel}
        </button>
        <button
          className="relative flex min-w-32.5 cursor-pointer items-center justify-center px-3 py-2 text-center"
          onClick={() => onChange?.('right')}>
          {rightLabel}
        </button>
      </motion.div>
    </div>
  );
}

export default LabeledSwitch;
