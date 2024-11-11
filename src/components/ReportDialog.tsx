import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ReportDialogProps {
  participant: Participant;
  onReport: (participantId: string, reason: string) => void;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Contenu inapproprié',
  'Harcèlement',
  'Spam',
  'Propos haineux',
  'Comportement suspect',
  'Autre'
];

export default function ReportDialog({ participant, onReport, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const finalReason = reason === 'Autre' ? customReason : reason;
    onReport(participant.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center space-x-2 text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-xl font-bold">Signaler {participant.username}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Motif du signalement
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {reason === 'Autre' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Précisez le motif
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                required
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-24"
                placeholder="Décrivez la raison du signalement..."
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              disabled={isSubmitting || (reason === 'Autre' && !customReason.trim())}
            >
              Signaler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}