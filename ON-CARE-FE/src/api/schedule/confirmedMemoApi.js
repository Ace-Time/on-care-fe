import api from '@/lib/api';

export const getConfirmedMemo = async ({ vsId } = {}) => {
  if (vsId == null) throw new Error('vsId is required');
  const res = await api.get('/api/confirmed-calendar/memo', {
    params: { vsId: Number(vsId) },
  });
  return res.data;
};

export const upsertConfirmedMemo = async ({ vsId, note } = {}) => {
  if (vsId == null) throw new Error('vsId is required');
  const res = await api.put('/api/confirmed-calendar/memo', {
    vsId: Number(vsId),
    note: note ?? '',
  });
  return res.data;
};