import { useState, useEffect } from 'react';
import { ContactMessage, subscribeToMessages, firestoreDeleteMessage, firestoreMarkMessageAsRead } from '../../firebase';
import { Mail, Trash2, CheckCircle2, Clock, Inbox, MailCheck, Reply } from 'lucide-react';
import { toast } from 'sonner';

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToMessages((msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm('Voulez-vous supprimer ce message ?')) {
      await firestoreDeleteMessage(id);
      toast.success('Message supprimé');
    }
  };

  const handleToggleRead = async (msg: ContactMessage) => {
    if (!msg.id) return;
    const nextState = !msg.read;
    await firestoreMarkMessageAsRead(msg.id, nextState);
    toast.success(nextState ? 'Message marqué comme lu' : 'Message marqué comme non lu');
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Messages reçus
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {unreadCount} non {unreadCount > 1 ? 'lus' : 'lu'}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Tous les messages envoyés depuis le formulaire de contact de votre portfolio sont stockés en direct dans Firestore.
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400">
          {messages.length} message{messages.length > 1 ? 's' : ''} au total
        </span>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">
          Chargement des messages depuis Firestore...
        </div>
      ) : messages.length === 0 ? (
        <div className="p-14 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-[#121214]/40">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
            Aucun message reçu pour le moment
          </h4>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Dès qu'un visiteur soumettra le formulaire de contact, son message apparaîtra instantanément ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-5 rounded-2xl border transition-all ${
                !msg.read
                  ? 'bg-white dark:bg-[#16161a] border-blue-500/30 shadow-sm'
                  : 'bg-white/70 dark:bg-[#121214] border-zinc-200 dark:border-zinc-800 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                    !msg.read 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {msg.name ? msg.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-zinc-950 dark:text-white">
                        {msg.name}
                      </h4>
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" title="Non lu" />
                      )}
                    </div>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-xs text-zinc-500 hover:text-blue-500 transition-colors flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{msg.email}</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </span>

                  <button
                    onClick={() => handleToggleRead(msg)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title={msg.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                  >
                    {msg.read ? <Mail className="w-4 h-4" /> : <MailCheck className="w-4 h-4 text-blue-500" />}
                  </button>

                  <a
                    href={`mailto:${msg.email}?subject=Réponse: Votre message sur mon portfolio`}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Répondre par email"
                  >
                    <Reply className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    title="Supprimer ce message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal whitespace-pre-wrap pl-12 bg-zinc-50 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
