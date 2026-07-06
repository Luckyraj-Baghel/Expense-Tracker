function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl w-full max-w-sm mx-4">
        <div className="text-center mb-5">
          <p className="text-3xl mb-3">👋</p>
          <h3 className="text-lg font-semibold text-white mb-1">Logging out?</h3>
          <p className="text-slate-400 text-sm">Are you sure you want to logout of your account?</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-2.5 rounded-xl transition duration-200 text-sm"
          >
            No, stay
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-xl transition duration-200 text-sm"
          >
            Yes, logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;