export const getLevelIcon = (level: number): string => {
  if (level >= 50) return 'diamond';
  if (level >= 30) return 'workspace_premium';
  if (level >= 15) return 'emoji_events';
  if (level >= 5) return 'military_tech';
  return 'star';
};
