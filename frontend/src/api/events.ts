import z from 'zod';
import { callApi } from '@/utils/api';

const CreateEventResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  date: z.string(),
});

export async function createEvent(accessToken: string, title: string, content: string, date: string) {
  return callApi(
    'API_GATEWAY',
    'POST',
    '/api/events',
    { title, content, date },
    CreateEventResponseSchema,
    accessToken
  );
}
