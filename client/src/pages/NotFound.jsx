import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6">
    <div className="max-w-md text-center">
      <p className="select-none text-6xl font-black text-indigo-100 sm:text-8xl">404</p>
      <h1 className="-mt-2 text-xl font-bold text-slate-800 sm:-mt-4 sm:text-2xl">Page not found</h1>
      <p className="text-slate-500 text-sm mt-2 mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
