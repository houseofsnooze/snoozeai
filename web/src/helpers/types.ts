export type Message = {
  fromUser: boolean;
  message: string;
  custom?: boolean;
};

export type User = {
  email: string;
  telegramHandle: string;
};
