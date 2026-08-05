import { Building2 } from 'lucide-react';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import type { Organization } from '../hooks/useOrganizations';

interface OrganizationFilterSelectProps {
  organizations: Organization[];
}

export const OrganizationFilterSelect = ({ organizations }: OrganizationFilterSelectProps) => {
  const { activeOrganizationId, setActiveOrganizationId } = useActiveOrganization();

  if (organizations.length === 0) return null;

  return (
    <div className="relative">
      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-muted pointer-events-none" />
      <select
        value={activeOrganizationId ?? ''}
        onChange={(e) => setActiveOrganizationId(e.target.value || null)}
        className="bg-app-surface border border-app-border rounded-2xl py-3 pl-9 pr-4 text-app-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-app-accent/50 appearance-none"
      >
        <option value="" className="bg-app-surface">Só minhas</option>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id} className="bg-app-surface">{organization.name}</option>
        ))}
      </select>
    </div>
  );
};
