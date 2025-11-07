import { DateTime } from 'luxon';
import React, { createContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import type { Program } from '../../interfaces';

interface ProgramContextValue {
  programs: Program[];
  addProgram: (program: Omit<Program, 'id' | 'createdAt'>) => void;
  updateProgram: (id: string, program: Omit<Program, 'id' | 'createdAt'>) => void;
  deleteProgram: (id: string) => void;
  getProgramById: (id: string) => Program | undefined;
}

export const ProgramContext = createContext<ProgramContextValue | undefined>(undefined);

interface ProgramProviderProps {
  children: React.ReactNode;
}

export const ProgramProvider = ({ children }: ProgramProviderProps) => {
  const [programs, setPrograms] = useLocalStorage<Program[]>('training-programs-programs', []);

  const addProgram = useCallback(
    (program: Omit<Program, 'id' | 'createdAt'>) => {
      const newProgram: Program = {
        ...program,
        createdAt: DateTime.now().toISO(),
        id: uuidv4(),
      };
      setPrograms(prev => [...prev, newProgram]);
    },
    [setPrograms],
  );

  const updateProgram = useCallback(
    (id: string, program: Omit<Program, 'id' | 'createdAt'>) => {
      setPrograms(prev =>
        prev.map(p => (p.id === id ? { ...program, createdAt: p.createdAt, id } : p)),
      );
    },
    [setPrograms],
  );

  const deleteProgram = useCallback(
    (id: string) => {
      setPrograms(prev => prev.filter(p => p.id !== id));
    },
    [setPrograms],
  );

  const getProgramById = useCallback(
    (id: string) => {
      return programs.find(p => p.id === id);
    },
    [programs],
  );

  const value = useMemo(
    () => ({
      addProgram,
      deleteProgram,
      getProgramById,
      programs,
      updateProgram,
    }),
    [programs, addProgram, updateProgram, deleteProgram, getProgramById],
  );

  return <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>;
};

ProgramProvider.displayName = 'ProgramProvider';
