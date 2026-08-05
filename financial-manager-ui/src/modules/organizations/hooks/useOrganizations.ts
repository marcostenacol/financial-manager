import { useCallback, useState } from 'react';
import { api } from '../../../services/api';

export interface Organization {
  id: string;
  name: string;
  role: 'owner' | 'member';
  createdAt: string;
}

export interface Invite {
  id: string;
  organizationId: string;
  code: string;
  role: 'owner' | 'member';
  maxUses: number | null;
  usesCount: number;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'member';
  createdAt: string;
  user: { id: string; email: string };
}

export interface InviteRedemption {
  id: string;
  inviteId: string;
  userId: string;
  usedAt: string;
  user: { id: string; email: string };
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/organizations');
      setOrganizations(response.data.data);
      return response.data.data as Organization[];
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrganization = useCallback(async (name: string) => {
    const response = await api.post('/organizations', { name });
    return response.data.data as Organization;
  }, []);

  const redeemInvite = useCallback(async (code: string) => {
    const response = await api.post(`/organizations/invites/${code}/redeem`);
    return response.data.data as Member;
  }, []);

  const loadMembers = useCallback(async (organizationId: string) => {
    const response = await api.get(`/organizations/${organizationId}/members`);
    return response.data.data as Member[];
  }, []);

  const removeMember = useCallback(async (organizationId: string, userId: string) => {
    await api.delete(`/organizations/${organizationId}/members/${userId}`);
  }, []);

  const transferOwnership = useCallback(async (organizationId: string, userId: string) => {
    const response = await api.patch(`/organizations/${organizationId}/transfer-ownership`, { user_id: userId });
    return response.data.data as Member;
  }, []);

  const loadInvites = useCallback(async (organizationId: string) => {
    const response = await api.get(`/organizations/${organizationId}/invites`);
    return response.data.data as Invite[];
  }, []);

  const createInvite = useCallback(async (organizationId: string, data: { role?: 'owner' | 'member'; max_uses?: number; expires_in_days: number }) => {
    const response = await api.post(`/organizations/${organizationId}/invites`, data);
    return response.data.data as Invite;
  }, []);

  const revokeInvite = useCallback(async (organizationId: string, inviteId: string) => {
    const response = await api.patch(`/organizations/${organizationId}/invites/${inviteId}/revoke`);
    return response.data.data as Invite;
  }, []);

  const deleteInvite = useCallback(async (organizationId: string, inviteId: string) => {
    await api.delete(`/organizations/${organizationId}/invites/${inviteId}`);
  }, []);

  const deleteOrganization = useCallback(async (organizationId: string) => {
    await api.delete(`/organizations/${organizationId}`);
  }, []);

  const loadInviteRedemptions = useCallback(async (organizationId: string, inviteId: string) => {
    const response = await api.get(`/organizations/${organizationId}/invites/${inviteId}/redemptions`);
    return response.data.data as InviteRedemption[];
  }, []);

  return {
    organizations,
    loading,
    loadOrganizations,
    createOrganization,
    redeemInvite,
    loadMembers,
    removeMember,
    transferOwnership,
    loadInvites,
    createInvite,
    revokeInvite,
    deleteInvite,
    deleteOrganization,
    loadInviteRedemptions,
  };
}
