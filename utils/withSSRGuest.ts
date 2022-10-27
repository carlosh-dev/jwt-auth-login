import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRGuest<P>(fn: GetServerSideProps<P>): GetServerSideProps<P> {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)

    if (cookies['admin.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        }
      }
    }

    return await fn(ctx)
  }
}