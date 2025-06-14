import { GetServerSideProps } from 'next';
import { Box, Button, Anchor, TextInput, Textarea } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { createEvent } from '@/api/events';
import { withAuth } from '@/utils/authentication';

interface FormData {
  title: string
  content: string
  date: string
}

interface Props {
  accessToken: string
}

// Runs in frontend server
export const getServerSideProps: GetServerSideProps<Props> = withAuth(
  async (_context, store) => {
    const { accessToken } = store.getState();
    return { props: { accessToken } };
  }
);
// --------------

export default function NewEvent({ accessToken }: Props) {
   const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      content: '',
      date: '',
    },
  });

  const createEventMutation = useMutation({
    mutationFn: (formData: FormData) => createEvent(
      accessToken, formData.title, formData.content, formData.date),
    onSuccess: () => {
      window.location.href = '/dashboard';
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const onSubmit: SubmitHandler<FormData> = (formData) => {
    createEventMutation.mutate(formData);
  };

  return (
    <Box w="400" ml="auto" mr="auto" mt="200">
      <h1>Create New Event</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="title"
          control={control}
          rules={{
            required: 'Required',
          }}
          render={
            ({ field }) => (
              <TextInput
                label="Title"
                placeholder="Enter your title"
                error={errors.title?.message}
                mb="md"
                {...field}
              />
            )
          }
        />

        <Controller
          name="content"
          control={control}
          rules={{
            required: 'Required',
          }}
          render={
            ({ field }) => (
              <Textarea
                label="Content"
                placeholder="Enter your content"
                error={errors.content?.message}
                mb="md"
                {...field}
              />
            )
          }
        />

        <Controller
          name="date"
          control={control}
          rules={{
            required: 'Required',
          }}
          render={
            ({ field }) => (
              <TextInput
                label="Date"
                placeholder="Enter a date"
                error={errors.date?.message}
                mb="md"
                {...field}
              />
            )
          }
        />

        <Button type="submit" loading={createEventMutation.isPending} fullWidth>Create Event</Button>
      </form>
    </Box>
  );
}
