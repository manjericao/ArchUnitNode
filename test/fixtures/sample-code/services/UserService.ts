import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';

/**
 * Service decorator
 */
function Service(target: any) {
  return target;
}

/**
 * User service class
 */
@Service
export class UserService {
  constructor(private userRepository: UserRepository) {}

  public async getUser(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  public async createUser(name: string, email: string): Promise<User> {
    const user = new User(name, email);
    return this.userRepository.save(user);
  }
}
