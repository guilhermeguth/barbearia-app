import { User } from "../entities/User";
import { Customer } from "../entities/Customer";

declare global {
  namespace Express {
    export interface Request {
      user: Partial<User> & {
        customer?: Customer;
        barber?: any; // Se necessário no futuro
      };
    }
  }
}
