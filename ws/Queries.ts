export type VerifyTokenResponse = {
  data: {
    verifyToken: {
      success: false;
      errors: any;
      payload: null;
    } | {
      success: true;
      errors: null;
      payload: {
        username: string,
        exp: number,
        origIat: number
      };
    };
  };
};

export type GetTokenResponse = {
  data: {
    tokenAuth: {
      success: boolean;
      errors: any | null;
      token: string;
      unarchiving: boolean;
      user: {
        id: string;
        username: string
      };
    };
  };
};

export const getToken = (username: string, password: string) =>
  `mutation {
  tokenAuth(
    username: "${username}"
    password: "${password}"
  ) {
    success,
    errors,
    token,
    refreshToken,
    unarchiving,
    user {
      id,
      username
    }
  }
}`;

export const verifyToken = (token: string) =>
  `mutation {
              verifyToken(
                token: "${token}"
              ) {
                success,
                errors,
                payload
              }
            }`;

export const getUsers = () =>
  `{
              users {
                edges {
                  node {
                    id
                  }
                }
              }
            }`;
