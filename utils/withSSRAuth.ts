import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import decode from 'jwt-decode'
import { validateUserPermissions } from "./validateUserPermissions";

interface WithSSRAuthProps {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthProps): GetServerSideProps<P> {

  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)

    const token = cookies['admin.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    if (options) {
      const user = decode<{ permissions: string[], roles: string[] }>(token);

      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermissions({ user, permissions, roles });

      if (userHasValidPermissions === false) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          }
        }
      }
    }

    try {
      return await fn(ctx)
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, 'admin.token');
        destroyCookie(ctx, 'admin.refreshToken');

        return {
          redirect: {
            destination: '/',
            permanent: false,
          }
        }
      }

      return err;
    }
  }
}