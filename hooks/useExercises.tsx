import { useState, useEffect, useCallback } from 'react';
import { Exercise, MuscleGroup } from '@/types/data';
import { storage } from '@/utils/storage';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const data = await storage.getExercises();
    setExercises(data);
    setLoading(false);
  };

  const addExercise = useCallback(async (
    name: string,
    muscleGroup: MuscleGroup,
    sets: number,
    reps: number,
    restSeconds: number,
    notes?: string
  ) => {
    const newExercise: Exercise = {
      id: generateId(),
      name,
      muscleGroup,
      sets,
      reps,
      restSeconds,
      notes,
      isCustom: true,
    };

    const updatedExercises = [...exercises, newExercise];
    setExercises(updatedExercises);
    await storage.setExercises(updatedExercises);
    return newExercise;
  }, [exercises]);

  const updateExercise = useCallback(async (id: string, updates: Partial<Exercise>) => {
    const updatedExercises = exercises.map(ex =>
      ex.id === id ? { ...ex, ...updates } : ex
    );
    setExercises(updatedExercises);
    await storage.setExercises(updatedExercises);
  }, [exercises]);

  const deleteExercise = useCallback(async (id: string) => {
    const updatedExercises = exercises.filter(ex => ex.id !== id);
    setExercises(updatedExercises);
    await storage.setExercises(updatedExercises);
  }, [exercises]);

  const getExerciseById = useCallback((id: string) => {
    return exercises.find(ex => ex.id === id) || null;
  }, [exercises]);

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || ex.muscleGroup === selectedMuscleGroup;
    return matchesSearch && matchesMuscleGroup;
  });

  const exercisesByGroup: Record<MuscleGroup, Exercise[]> = {} as Record<MuscleGroup, Exercise[]>;
  filteredExercises.forEach(ex => {
    if (!exercisesByGroup[ex.muscleGroup]) {
      exercisesByGroup[ex.muscleGroup] = [];
    }
    exercisesByGroup[ex.muscleGroup].push(ex);
  });

  return {
    exercises,
    filteredExercises,
    exercisesByGroup,
    loading,
    searchQuery,
    setSearchQuery,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    addExercise,
    updateExercise,
    deleteExercise,
    getExerciseById,
    refreshExercises: loadExercises,
  };
}
