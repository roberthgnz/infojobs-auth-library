export const removeEmpty = (obj: any) => {
  return Object.entries(obj).reduce((a, [k, v]) => (v ? { ...a, [k]: v } : a), {});
};
