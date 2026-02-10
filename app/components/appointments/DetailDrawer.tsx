import { FileText, XCircle } from "lucide-react";

export default function DetailDrawer({ request, onClose, onAction }: any) {
  return (
    <div className="fixed inset-y-0 right-0 w-full lg:w-[500px] bg-white shadow-2xl z-40 flex flex-col transition-transform">
      <div className="p-6 border-b flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-bold">Patient Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg"><XCircle /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Profile Info */}
        <section className="flex items-center gap-6">
          <img src={request.profile_url} className="w-24 h-24 rounded-3xl object-cover" />
          <div>
            <h3 className="text-2xl font-bold">{request.first_name} {request.last_name}</h3>
            <p className="text-slate-500">{request.email}</p>
          </div>
        </section>

        {/* Reports Section */}
        <section>
          <h4 className="font-bold text-slate-900 mb-4">Medical Reports</h4>
          <div className="grid grid-cols-2 gap-4">
            {request.report_urls.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" className="flex items-center gap-3 p-3 border rounded-xl hover:bg-cyan-50 border-slate-200">
                <FileText className="text-cyan-600" />
                <span className="text-xs font-bold truncate">Report_{i+1}.pdf</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="p-6 bg-slate-50 border-t flex gap-4">
        <button onClick={() => onAction('reject')} className="flex-1 py-4 font-bold text-red-600 bg-white border-2 border-red-100 rounded-2xl hover:bg-red-50">Reject</button>
        <button onClick={() => onAction('approve')} className="flex-1 py-4 font-bold text-white bg-cyan-600 rounded-2xl shadow-lg shadow-cyan-200">Accept Request</button>
      </div>
    </div>
  );
}