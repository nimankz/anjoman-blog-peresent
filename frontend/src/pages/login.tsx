import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { TextInput, Button, Box, Divider, Anchor, Alert, PasswordInput } from '@mantine/core';
import AuthLayout from '@/components/AuthLayout';
import { createSession } from '@/api/sessions';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { getErrorMessage } from '@/utils/errorHandler';

interface Props {}

interface FormData {
  email: string
  password: string
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { accessToken } = context.req.cookies;

  if (accessToken) {
    return {
      redirect: {
        destination: '/organizations?enter_default=true',
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default function Login() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (formData: FormData) => createSession({
      provider: 'credentials',
      email: formData.email,
      password: formData.password,
    }),
    onSuccess: () => {
      try {
        const encodedDst = router.query.dst as string;
        if (encodedDst) {
          window.location.href = atob(decodeURIComponent(encodedDst));
        } else {
          window.location.href = '/dashboard';
        }
      } catch (_error) {
        window.location.href = '/organizations?enter_default=true';
      }
    },
  });

  const onSubmit: SubmitHandler<FormData> = (formData) => {
    loginMutation.mutate(formData);
  };

  return (
    <AuthLayout
      pageHeadTitle="Log in to your account - Awesome Project"
      pageHeadDescription="Enter your email and password to log in or choose to continue with Google"
      pageTitle="Log in to your account"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={
            ({ field }) => (
              <TextInput
                label="Email"
                placeholder="Enter your email"
                error={errors.email?.message}
                mb="md"
                {...field}
              />
            )
          }
        />
        <Controller
          name="password"
          control={control}
          rules={{ required: 'Required' }}
          render={
            ({ field }) => (
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                mb="xl"
                {...field}
              />
            )
          }
        />
        {
          loginMutation.isError && (
            <Alert mb="xl" variant="light" color="red">
              {getErrorMessage(loginMutation.error)}
            </Alert>
          )
        }
        <Button type="submit" loading={loginMutation.isPending} fullWidth>Login</Button>
        <Divider my="md" label="Or" labelPosition="center" />
        <GoogleAuthButton />
        <Box ta="center">
          Don't have an account? <Anchor href="/signup">Signup</Anchor>
        </Box>
        <Box ta="center">
          <Anchor href="/reset-password">Forgot password?</Anchor>
        </Box>
      </form>
    </AuthLayout>
  );
}
