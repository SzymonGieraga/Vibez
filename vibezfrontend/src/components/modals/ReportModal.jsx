import React, { useState } from 'react';
import { apiClient } from '../../api/apiClient';
import { auth } from '../../firebaseConfig'; // Upewnij się, że ścieżka jest poprawna

export default function ReportModal({ isOpen, onClose, contentId, type }) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Pobieramy token bezpośrednio z Firebase Auth
            const token = await auth.currentUser.getIdToken();

            await apiClient('/reports', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ type, contentId, reason })
            });
            setReason('');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0  bg-black/15 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className=" bg-black/15 backdrop-blur-xl p-6 rounded-lg w-full max-w-md border border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-white">Zgłoś zawartość</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Podaj powód zgłoszenia..."
                        className="w-full bg-gray-800 text-white p-3 rounded resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows="4"
                        required
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Wysyłanie...' : 'Zgłoś'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}