import { apiAuthenticated, apiUnauthenticated } from "./api";

interface LoginResponseInterface {
  access_token: string;
  token_type: string;
}

interface UserInterface {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: Date;
}

const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<LoginResponseInterface | null> => {
  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await apiUnauthenticated.post(
      "/api/v1/auth/login",
      formData
    );
    if (response.status !== 200) {
      return null;
    }
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const registerUser = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}): Promise<UserInterface | null> => {
  try {
    const response = await apiUnauthenticated.post("/api/v1/auth/register", {
      username,
      email,
      password,
    });
    if (response.status !== 201) {
      console.error(response);
      return null;
    }
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const fetchUserProfile = async (): Promise<UserInterface | null> => {
  try {
    const response = await apiAuthenticated.get("/api/v1/users/me");
    if (response.status !== 200) {
      console.error(response);
      return null;
    }
    const data: UserInterface = {
      ...response.data,
      created_at: new Date(response.data.created_at),
    };
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const logoutUser = async (): Promise<{ message: string } | null> => {
  try {
    const response = await apiAuthenticated.post("/api/v1/auth/logout");
    if (response.status !== 200) {
      console.error(response);
      return null;
    }
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getAccessTokenWithRefreshToken =
  async (): Promise<LoginResponseInterface | null> => {
    try {
      const response = await apiUnauthenticated.post("/api/v1/auth/refresh");
      if (response.status !== 200) {
        console.error(response);
        return null;
      }
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

export type { UserInterface, LoginResponseInterface };
export {
  loginUser,
  registerUser,
  fetchUserProfile,
  logoutUser,
  getAccessTokenWithRefreshToken,
};
