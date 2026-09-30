import { useEffect, useState } from "react";
import axios from "axios";
import ComposeModal from "./components/ComposeModal";

type Email = {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt: string | null;
  status: string;
};

const API_URL = "http://localhost:5000";

function App() {
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/emails`);
      setEmails(response.data.emails);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const displayedEmails = emails.filter((email) =>
    activeTab === "scheduled"
      ? email.status === "scheduled" || email.status === "processing"
      : email.status === "sent" || email.status === "failed"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">ReachInbox</h1>
            <p className="text-sm text-gray-500">Email Scheduler</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">Srujan Kumar</p>
              <p className="text-xs text-gray-500">Software Developer</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white font-semibold">
              SK
            </div>

            <button className="text-sm text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Campaigns</h2>
            <p className="mt-1 text-sm text-gray-500">
              Schedule and monitor your outbound emails.
            </p>
          </div>

          <button
            onClick={() => setShowCompose(true)}
            className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Compose New Email
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-6 border-b">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`pb-3 text-sm font-medium ${activeTab === "scheduled"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500"
              }`}
          >
            Scheduled Emails
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`pb-3 text-sm font-medium ${activeTab === "sent"
                ? "border-b-2 border-gray-900 text-gray-900"
                : "text-gray-500"
              }`}
          >
            Sent Emails
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading emails...</div>
          ) : displayedEmails.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-gray-700">No emails found</p>
              <p className="mt-1 text-sm text-gray-500">
                Your {activeTab} emails will appear here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-600">Email</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Subject</th>
                  <th className="px-6 py-4 font-medium text-gray-600">
                    {activeTab === "scheduled" ? "Scheduled Time" : "Sent Time"}
                  </th>
                  <th className="px-6 py-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>

              <tbody>
                {displayedEmails.map((email) => (
                  <tr key={email.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {email.recipient}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{email.subject}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(
                        activeTab === "scheduled"
                          ? email.scheduledAt
                          : email.sentAt!
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${email.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : email.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {email.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onScheduled={() => {
            fetchEmails();
          }}
        />
      )}
    </div>
  );
}

export default App;