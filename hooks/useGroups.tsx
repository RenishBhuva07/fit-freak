import { useState, useEffect, useCallback } from 'react';
import { WorkoutGroup, DayOfWeek, Exercise } from '@/types/data';
import { storage } from '@/utils/storage';
import { GROUP_COLORS } from '@/constants';
import { estimateWorkoutDuration } from '@/utils/streak';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useGroups(exercises: Exercise[]) {
  const [groups, setGroups] = useState<WorkoutGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const data = await storage.getGroups();
    setGroups(data);
    setLoading(false);
  };

  const addGroup = useCallback(async (
    name: string,
    exerciseIds: string[],
    days: DayOfWeek[],
    color?: string,
    icon?: string
  ) => {
    const newGroup: WorkoutGroup = {
      id: generateId(),
      name,
      exerciseIds,
      days,
      color: color || GROUP_COLORS[groups.length % GROUP_COLORS.length],
      icon,
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    await storage.setGroups(updatedGroups);
    return newGroup;
  }, [groups]);

  const updateGroup = useCallback(async (id: string, updates: Partial<WorkoutGroup>) => {
    const updatedGroups = groups.map(g =>
      g.id === id ? { ...g, ...updates } : g
    );
    setGroups(updatedGroups);
    await storage.setGroups(updatedGroups);
  }, [groups]);

  const deleteGroup = useCallback(async (id: string) => {
    const updatedGroups = groups.filter(g => g.id !== id);
    setGroups(updatedGroups);
    await storage.setGroups(updatedGroups);
  }, [groups]);

  const getGroupById = useCallback((id: string) => {
    return groups.find(g => g.id === id) || null;
  }, [groups]);

  const getGroupExercises = useCallback((groupId: string): Exercise[] => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];

    return group.exerciseIds
      .map(exId => exercises.find(ex => ex.id === exId))
      .filter((ex): ex is Exercise => ex !== undefined);
  }, [groups, exercises]);

  const getGroupEstimatedDuration = useCallback((groupId: string): number => {
    const groupExercises = getGroupExercises(groupId);
    return estimateWorkoutDuration(groupExercises);
  }, [getGroupExercises]);

  const getGroupsForDay = useCallback((day: DayOfWeek): WorkoutGroup[] => {
    return groups.filter(g => g.days.includes(day));
  }, [groups]);

  return {
    groups,
    loading,
    addGroup,
    updateGroup,
    deleteGroup,
    getGroupById,
    getGroupExercises,
    getGroupEstimatedDuration,
    getGroupsForDay,
    refreshGroups: loadGroups,
  };
}
