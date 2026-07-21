import { MonthlyContractDto } from '../types/api';

export type AuthStackParamList = {
  Login: undefined;
};

export type SetupStackParamList = {
  SelectParkingLot: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Dashboard: undefined;
  CheckIn: undefined;
  Sessions: undefined;
  Contracts: undefined;
  Reports: undefined;
  Users: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  SelectParkingLot: undefined;
  MainTabs: undefined;
  CheckOut: { sessionId: string; licensePlate: string; slotCode: string };
  CreateContract: { preferredSlotId?: string; preferredSlotCode?: string } | undefined;
  EditContract: { contract: MonthlyContractDto };
};
