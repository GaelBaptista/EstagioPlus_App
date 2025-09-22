export type RootStackParamList = {
  Login: undefined;          // mude para undefined se não usa params
  Home: undefined;
  Points: { uf: string; city: string };
  Details: { benefit?: any; location?: any };
  Results: { state: string; city: string; categoryId?: number };
};
