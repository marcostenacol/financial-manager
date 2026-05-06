import { container } from 'tsyringe';

import { CacheTrait } from '@/base/traits/CacheTrait';

// Traits & Base
container.registerSingleton<CacheTrait>('CacheTrait', CacheTrait);

// Repositories
import { AuthRepositoryInterface } from '@/modules/auth/repositories/contracts/AuthRepositoryInterface';
import { AuthRepository } from '@/modules/auth/repositories/AuthRepository';

container.registerSingleton<AuthRepositoryInterface>('AuthRepository', AuthRepository);

// Services
import { RegisterService } from '@/modules/auth/services/RegisterService';
import { LoginService } from '@/modules/auth/services/LoginService';

container.registerSingleton<RegisterService>('RegisterService', RegisterService);
container.registerSingleton<LoginService>('LoginService', LoginService);
