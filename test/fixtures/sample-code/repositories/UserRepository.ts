import { User } from '../models/User';

/**
 * Repository decorator
 */
function Repository(target: any) {
  return target;
}

/**
 * User repository
 */
@Repository
export class UserRepository {
  private users: Map<string, User> = new Map();

  public async findById(id: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  public async save(user: User): Promise<User> {
    const id = Math.random().toString(36).substring(7);
    user.id = id;
    this.users.set(id, user);
    return user;
  }
}
