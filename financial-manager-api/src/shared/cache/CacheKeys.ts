export const CacheKeys = {
  auth: {
    token: (userId: string): string => `auth:token:${userId}`,
  },
  profile: {
    detail: (userId: string): string => `profile:user:${userId}`,
  },
  wallets: {
    list: (userId: string): string => `wallets:user:${userId}`,
    detail: (walletId: string): string => `wallet:detail:${walletId}`,
  },
  categories: {
    list: (userId: string): string => `categories:user:${userId}`,
  },
  transactions: {
    list: (userId: string, filters?: unknown): string => `transactions:user:${userId}:${JSON.stringify(filters ?? {})}`,
    listPattern: (userId: string): string => `transactions:user:${userId}*`,
    byWallet: (walletId: string): string => `transactions:wallet:${walletId}`,
    byWalletPattern: (walletId: string): string => `transactions:wallet:${walletId}*`,
    detail: (transactionId: string): string => `transaction:detail:${transactionId}`,
  },
  recurrences: {
    list: (userId: string): string => `recurrences:user:${userId}`,
  },
  savingsGoals: {
    list: (userId: string): string => `savings-goals:user:${userId}`,
  },
  notifications: {
    list: (userId: string): string => `notifications:user:${userId}`,
  },
  reports: {
    overview: (userId: string): string => `reports:overview:${userId}`,
    expensesByCategory: (userId: string, month: number, year: number): string =>
      `reports:expenses-category:${userId}:${month}:${year}`,
    monthlyEvolution: (userId: string): string => `reports:monthly-evolution:${userId}`,
  },
} as const;
