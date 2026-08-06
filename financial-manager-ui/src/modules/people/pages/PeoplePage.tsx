import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, QrCode, Pencil, ArrowDownCircle, ArrowUpCircle, Repeat, Calendar } from 'lucide-react';
import { CreatePersonModal } from '../components/CreatePersonModal';
import { UpdatePersonModal } from '../components/UpdatePersonModal';
import { PixQrCodeModal } from '../components/PixQrCodeModal';
import { SettleDebtModal } from '../components/SettleDebtModal';
import { useToast } from '../../../shared/components/useToast';
import { usePeople, isPersonPaidThisPeriod, type Person, type SettleDirection } from '../hooks/usePeople';
import { useScope } from '../../../contexts/useScope';
import { useActiveOrganization } from '../../../contexts/useActiveOrganization';
import { useOrganizations } from '../../organizations/hooks/useOrganizations';
import { OrganizationFilterSelect } from '../../organizations/components/OrganizationFilterSelect';
import { getErrorMessage } from '../../../shared/lib/getErrorMessage';

export const PeoplePage = () => {
  const { showToast } = useToast();
  const { scope } = useScope();
  const { activeOrganizationId } = useActiveOrganization();
  const { people, loading, loadPeople } = usePeople(scope);
  const { organizations, loadOrganizations } = useOrganizations();
  const visiblePeople = scope === 'business'
    ? people.filter((person) => person.organizationId === activeOrganizationId)
    : people;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [settleDirection, setSettleDirection] = useState<SettleDirection | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  useEffect(() => {
    loadPeople().catch((err) => showToast(getErrorMessage(err, 'Erro ao carregar pessoas'), 'error'));
    loadOrganizations().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const handleEdit = (person: Person) => {
    setSelectedPerson(person);
    setIsUpdateModalOpen(true);
  };

  const handleShowQrCode = (e: React.MouseEvent, person: Person) => {
    e.stopPropagation();
    setSelectedPerson(person);
    setIsQrModalOpen(true);
  };

  const handleSettle = (e: React.MouseEvent, person: Person, direction: SettleDirection) => {
    e.stopPropagation();
    setSelectedPerson(person);
    setSettleDirection(direction);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="ledger-title text-4xl text-app-ink">Pessoas</h1>
          <p className="text-app-muted">Controle quem te deve, quem você deve e o PIX de cada um</p>
        </div>
        <div className="flex items-center gap-4">
          {scope === 'business' && <OrganizationFilterSelect organizations={organizations} />}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-app-accent hover:opacity-90 text-app-ink px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-app-card"
          >
            <Plus className="w-5 h-5" />
            Nova Pessoa
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-app-surface border border-app-border rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {visiblePeople.map((person) => {
              const paidThisPeriod = isPersonPaidThisPeriod(person);
              const theyOweMe = Number(person.theyOweMe);
              const iOweThem = Number(person.iOweThem);

              return (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleEdit(person)}
                  className="ledger-item bg-app-surface border border-app-border p-6 rounded-3xl shadow-app-card cursor-pointer hover:border-app-accent/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-app-ink font-bold text-lg">{person.name}</h3>
                      <span className="ledger-stamp mt-1 inline-flex items-center gap-1 text-app-accent">
                        {person.paymentFrequency === 'MONTHLY' ? <Repeat className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                        {person.paymentFrequency === 'MONTHLY' ? 'Mensal' : 'Avulsa'}
                        {paidThisPeriod && person.paymentFrequency === 'MONTHLY' && ' · pago este mês'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleShowQrCode(e, person)}
                        title="Ver QR Code PIX"
                        className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted hover:text-app-accent"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(person); }}
                        className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted hover:text-app-ink"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-app-success">
                        <ArrowDownCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs text-app-muted">Ela me deve</span>
                      </div>
                      <span className="ledger-figure text-app-ink">
                        {theyOweMe.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    {theyOweMe > 0 && (
                      <button
                        onClick={(e) => handleSettle(e, person, 'they_owe_me')}
                        className="w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wide bg-app-success-soft text-app-success hover:opacity-80 transition-all"
                      >
                        Registrar recebimento
                      </button>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-app-border">
                      <div className="flex items-center gap-2 text-app-danger">
                        <ArrowUpCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs text-app-muted">Eu devo a ela</span>
                      </div>
                      <span className="ledger-figure text-app-ink">
                        {iOweThem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    {iOweThem > 0 && (
                      <button
                        onClick={(e) => handleSettle(e, person, 'i_owe_them')}
                        className="w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wide bg-app-surface-2 text-app-muted hover:text-app-ink transition-all"
                      >
                        Registrar pagamento
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {visiblePeople.length === 0 && !loading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-app-surface-2 rounded-full mb-4">
                <Users className="w-12 h-12 text-app-muted" />
              </div>
              <h3 className="text-app-ink font-bold text-lg">Nenhuma pessoa cadastrada</h3>
              <p className="text-app-muted mt-1">Cadastre quem te deve, quem você deve, e gere o PIX na hora.</p>
            </div>
          )}
        </div>
      )}

      <CreatePersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadPeople}
      />

      <UpdatePersonModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={loadPeople}
        person={selectedPerson}
      />

      <PixQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        person={selectedPerson}
      />

      <SettleDebtModal
        isOpen={!!settleDirection}
        onClose={() => setSettleDirection(null)}
        onSuccess={loadPeople}
        person={selectedPerson}
        direction={settleDirection}
      />
    </div>
  );
};
