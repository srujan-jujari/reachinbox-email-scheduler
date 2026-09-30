import { useState } from "react";
import axios from "axios";

type Props = {
  onClose: () => void;
  onScheduled: () => void;
};

const API_URL = "http://localhost:5000";

export default function ComposeModal({
  onClose,
  onScheduled,
}: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [delay, setDelay] = useState("2");
  const [hourlyLimit, setHourlyLimit] = useState("10");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = String(e.target?.result || "");

      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const emails = lines.filter((line) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line)
      );

      setRecipients([...new Set(emails)]);
    };

    reader.readAsText(file);
  };

  const handleSchedule = async () => {
    setError("");

    if (!subject || !body) {
      setError("Subject and body are required.");
      return;
    }

    if (recipients.length === 0) {
      setError("Please upload a file containing email addresses.");
      return;
    }

    if (!startTime) {
      setError("Please select a start time.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/api/emails/schedule`,
        {
          subject,
          body,
          recipients,
          startTime: new Date(startTime).toISOString(),
          delay: Number(delay),
          hourlyLimit: Number(hourlyLimit),
        }
      );

      onScheduled();
      onClose();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Failed to schedule emails."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">
              Compose New Email
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create and schedule your email campaign.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 p-6">
          {/* Subject */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Subject
            </label>

            <input
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              placeholder="Enter email subject"
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          {/* Body */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Body
            </label>

            <textarea
              value={body}
              onChange={(e) =>
                setBody(e.target.value)
              }
              placeholder="Write your email..."
              rows={5}
              className="w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none focus:border-gray-900"
            />
          </div>

          {/* CSV */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Lead File
            </label>

            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="block w-full rounded-lg border p-3 text-sm"
            />

            {recipients.length > 0 && (
              <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm">
                <strong>
                  {recipients.length}
                </strong>{" "}
                email addresses detected.
              </div>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Start Time
            </label>

            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) =>
                setStartTime(e.target.value)
              }
              className="w-full rounded-lg border px-4 py-3 text-sm"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Delay Between Emails
              </label>

              <div className="flex">
                <input
                  type="number"
                  min="0"
                  value={delay}
                  onChange={(e) =>
                    setDelay(e.target.value)
                  }
                  className="w-full rounded-l-lg border px-4 py-3 text-sm"
                />

                <span className="flex items-center rounded-r-lg border border-l-0 bg-gray-50 px-3 text-sm text-gray-500">
                  sec
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Hourly Limit
              </label>

              <input
                type="number"
                min="1"
                value={hourlyLimit}
                onChange={(e) =>
                  setHourlyLimit(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 text-sm"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-5">
            <button
              onClick={onClose}
              className="rounded-lg border px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              onClick={handleSchedule}
              disabled={loading}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading
                ? "Scheduling..."
                : "Schedule Emails"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}