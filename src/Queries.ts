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

export const getToken = async (username: string, password: string) => {
  const query = `mutation {
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
}`

  return await graphQlRequest<GetTokenResponse>(query)
}

export const verifyToken = async (token: string) => {
  const query = `mutation {
              verifyToken(
                token: "${token}"
              ) {
                success,
                errors,
                payload
              }
            }`
  return await graphQlRequest<VerifyTokenResponse>(query)
}

export const getUsers = async () => {
  const query = `{
              users {
                edges {
                  node {
                    id
                  }
                }
              }
            }`
  return await graphQlRequest(query)
}

export const graphQlRequest = async <T = any>(query: any): Promise<T> => {
  const result = await fetch(Deno.env.get('GRAPHQL_URL')!, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    method: 'post',
    body: JSON.stringify({query}),
  })

  return (await result.json()) as unknown as T
}
