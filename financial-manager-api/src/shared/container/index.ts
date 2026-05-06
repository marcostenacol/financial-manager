import { container } from 'tsyringe';

import { CacheTrait } from '@/base/traits/CacheTrait';

// Traits & Base
container.registerSingleton<CacheTrait>('CacheTrait', CacheTrait);

// Repositories (To be added)

// Services (To be added)
