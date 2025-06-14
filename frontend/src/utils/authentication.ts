import { GetServerSideProps } from 'next';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next/types';
import { StoreApi } from 'zustand';
import { serialize } from 'cookie';
import { StoreInterface } from '@/stores/interface';
import { initializeStore } from '@/stores/store';

type Props = {};

type WithAuthPageProps = {
  initialZustandState: any
};

export const withAuth = <T, P extends T & WithAuthPageProps>(
  gssp: (
    context: GetServerSidePropsContext,
    store: StoreApi<StoreInterface>,
  ) => Promise<GetServerSidePropsResult<T>>
): GetServerSideProps<P> => {
  return async (context) => {
    const store = initializeStore();
    const { accessToken } = context.req.cookies;
    if (accessToken) {
      try {
        await store.getState().getSession(accessToken);
      } catch (error) {
        console.warn('Access token found in the request cookie was invalid. Logging out.', error);
        context.res.setHeader('Set-Cookie', serialize('accessToken', '', { path: '/' }));
      }
    }

    if (!store.getState().accessToken) {
      let destination = '/login';
      if (context.resolvedUrl !== '/') {
        destination += `?dst=${btoa(context.resolvedUrl)}`;
      }
      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }

    // if (!store.getState().user.onboarded && context.resolvedUrl !== '/onboarding') {
    //   return {
    //     redirect: {
    //       destination: '/onboarding',
    //       permanent: false,
    //     },
    //   };
    // }

    const result = await gssp(context, store);
    const resultProps = 'props' in result ? result.props : {};
    return {
      ...result,
      props: {
        ...resultProps,
        initialZustandState: JSON.parse(JSON.stringify(store.getState())),
      } as T & P,
    };
  };
};
