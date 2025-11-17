import { UserService } from '../services/UserService';

/**
 * Controller decorator
 */
function Controller(target: any) {
  return target;
}

/**
 * User controller
 */
@Controller
export class UserController {
  constructor(private userService: UserService) {}

  public async getUser(req: any, res: any): Promise<void> {
    const user = await this.userService.getUser(req.params.id);
    res.json(user);
  }

  public async createUser(req: any, res: any): Promise<void> {
    const user = await this.userService.createUser(req.body.name, req.body.email);
    res.json(user);
  }
}
