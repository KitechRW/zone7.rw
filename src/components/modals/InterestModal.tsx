import { useInterest } from "@/contexts/InterestContext";
import { Loader2, ShieldAlert, X } from "lucide-react";
import { useState } from "react";

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    userName?: string;
    userEmail: string;
    userPhone?: string;
    message?: string;
  }) => void;
  loading: boolean;
  propertyTitle: string;
  isAuthenticated?: boolean;
  userEmail?: string;
  userName?: string;
}

const InterestModal: React.FC<InterestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  propertyTitle,
  isAuthenticated = false,
  userEmail: initialUserEmail = "",
  userName: initialUserName = "",
}) => {
  const [userName, setUserName] = useState(initialUserName);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [userPhone, setUserPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  const { error: interestError } = useInterest();

  const validatePhone = (phone: string) => {
    const normalized = phone.replace(/[\s\-()]/g, "");
    const e164 = /^\+?[1-9]\d{8,14}$/;
    const local = /^0\d{9}$/;
    return e164.test(normalized) || local.test(normalized);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    } = {};

    if (!userEmail.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (userPhone.trim() && !validatePhone(userPhone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (message.length > 500) {
      newErrors.message = "Message must be at most 500 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        userName: userName.trim() || undefined,
        userEmail: userEmail.trim(),
        userPhone: userPhone.trim() || undefined,
        message: message.trim() || undefined,
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setUserName(initialUserName);
      setUserEmail(initialUserEmail);
      setUserPhone("");
      setMessage("");
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-sm shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Place Interest
            </h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 hover:text-red-700 cursor-pointer" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4 py-2 bg-gray-50 rounded-sm">
            <p className="text-gray-600">Property:</p>
            <p className="font-semibold text-black">{propertyTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isAuthenticated && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your name"
                    disabled={loading}
                    className={`w-full px-2 text-sm py-3 border-2 rounded-sm text-neutral-700 focus:border-light-blue outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email <span className="text-red-800">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    disabled={loading}
                    className={`w-full px-2 text-sm py-3 border-2 rounded-sm text-neutral-700 focus:border-light-blue outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+250 788 123 456"
                  disabled={loading}
                  className={`w-full px-2 text-sm py-3 border-2 rounded-sm text-neutral-700 focus:border-light-blue outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Comment (Optional)
              </label>
              <div className="relative">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more about your interest or any questions you have..."
                  rows={4}
                  disabled={loading}
                  className={`w-full px-2 text-sm py-2 border-2 rounded-sm text-neutral-700 focus:border-blue-500 outline-none transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.message
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
              </div>
              <div className="flex justify-between items-center mt-1">
                {errors.message && (
                  <p className="text-sm text-red-600">{errors.message}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {message.length}/500
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-sm font-medium hover:shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Place Interest</>
                )}
              </button>
            </div>
          </form>

          {interestError && (
            <p className="flex items-center pt-0.5 mt-5 text-red-500 text-xs">
              <ShieldAlert className="w-4 h-4 mr-1" /> {interestError}
            </p>
          )}

          <div className="mt-10 p-3 bg-blue-50 rounded-sm">
            <p className="text-xs text-blue-900">
              By placing interest, you&#39;ll be contacted by our team to
              discuss this property.
              {!isAuthenticated && (
                <span>
                  <br />
                  <br />
                  <strong>Note:</strong> Email is required, Name and Phone
                  number are optional but strongly recommended for easy and
                  quick communication.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestModal;
