"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { isSuperAdmin } from "@/utils/roleCheck";
import { superAdminApi } from "@/services/api";
import { Admin } from "@/types";
import PageHeader from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { AxiosError } from "axios";

const DOMAINS = [
    "Web Developer",
    "App Developer",
    "Machine Learning",
    "Tech Member",
    "Public Relations",
    "Video Editor",
    "Content Writer",
    "Graphics Designer",
    "Photographer"
];

const ROLES = [
    { value: "domain_lead", label: "Domain Lead (Domain Restricted)" },
    { value: "super_domain_admin", label: "Super Domain Admin (All Domains)" },
    { value: "super_admin", label: "Super Admin (Full System Access)" }
];

export default function AdminManagementPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "domain_lead",
        assignedDomains: [] as string[]
    });

    const [search, setSearch] = useState(""); 

    const [editData, setEditData] = useState({
        role: "",
        assignedDomains: [] as string[]
    });

    const [submitting, setSubmitting] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

    // Check authorization
    useEffect(() => {
        if (!isLoading && !isSuperAdmin(user)) {
            router.push("/unauthorized");
        }
    }, [user, isLoading, router]);

    // Fetch admins
    useEffect(() => {
        if (isSuperAdmin(user)) {
            fetchAdmins();
        }
    }, [user]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await superAdminApi.getAllAdmins();
            if (response.data.success) {
                setAdmins(response.data.admins);
            } else {
                toast.error(response.data.message || "Failed to fetch admins");
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
            toast.error("Error fetching admins");
        } finally {
            setLoading(false);
        }
    };

    const extractApiMessage = (error: unknown): string | undefined => {
        if (error instanceof AxiosError) {
            if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
                return "Request timed out. Is the API running? Check NEXT_PUBLIC_DEV_API_URL (e.g. http://localhost:8080/api/v1) matches your server.";
            }
            if (error.code === "ERR_NETWORK" || (error.request && !error.response)) {
                return "Cannot reach the API. Start the backend, verify the URL in .env, and that CORS allows this site.";
            }
            const data = error.response?.data as { message?: string } | undefined;
            return data?.message;
        }
        return undefined;
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim() || !formData.email?.trim()) {
            toast.error("Name and email are required");
            return;
        }

        if (
            (formData.role === "domain_lead") &&
            formData.assignedDomains.length === 0
        ) {
            toast.error("Select at least one domain for Domain Lead");
            return;
        }

        const pwd = formData.password.trim();
        if (pwd && pwd.length < 6) {
            toast.error("Password must be at least 6 characters, or leave blank to auto-generate");
            return;
        }

        try {
            setSubmitting(true);
            const payload: Record<string, unknown> = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                role: formData.role,
                assignedDomains: formData.assignedDomains,
            };
            if (pwd) payload.password = pwd;

            const response = await superAdminApi.addAdmin(payload);

            if (response.data.success) {
                toast.success("Admin added successfully");
                const plainPassword = response.data.admin?.password ?? null;
                setGeneratedPassword(plainPassword);
                setFormData({ name: "", email: "", password: "", role: "domain_lead", assignedDomains: [] });
                setShowAddModal(false);
                fetchAdmins();

                if (plainPassword) {
                    setTimeout(() => setGeneratedPassword(null), 120000);
                }
            } else {
                toast.error(response.data.message || "Failed to add admin");
            }
        } catch (error) {
            console.error("Error adding admin:", error);
            toast.error(extractApiMessage(error) || "Error adding admin");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;

        if (
            (editData.role === "domain_lead") &&
            editData.assignedDomains.length === 0
        ) {
            toast.error("Select at least one domain for Domain Lead");
            return;
        }

        try {
            setSubmitting(true);
            const response = await superAdminApi.updateAdminRole({
                adminId: selectedAdmin._id,
                role: editData.role,
                assignedDomains: editData.assignedDomains
            });

            if (response.data.success) {
                toast.success("Admin role updated successfully");
                setShowEditModal(false);
                fetchAdmins();
            } else {
                toast.error(response.data.message || "Failed to update role");
            }
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error(extractApiMessage(error) || "Error updating role");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAdmin = async (adminId: string) => {
        if (!confirm("Are you sure you want to delete this admin?")) return;

        try {
            const response = await superAdminApi.removeAdmin(adminId);

            if (response.data.success) {
                toast.success("Admin deleted successfully");
                fetchAdmins();
            } else {
                toast.error(response.data.message || "Failed to delete admin");
            }
        } catch (error) {
            console.error("Error deleting admin:", error);
            toast.error(extractApiMessage(error) || "Error deleting admin");
        }
    };

    const toggleDomain = (domain: string, isEdit = false) => {
        if (isEdit) {
            setEditData(prev => ({
                ...prev,
                assignedDomains: prev.assignedDomains.includes(domain)
                    ? prev.assignedDomains.filter(d => d !== domain)
                    : [...prev.assignedDomains, domain]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                assignedDomains: prev.assignedDomains.includes(domain)
                    ? prev.assignedDomains.filter(d => d !== domain)
                    : [...prev.assignedDomains, domain]
            }));
        }
    };

    const openEditModal = (admin: Admin) => {
        setSearch("");
        setSelectedAdmin(admin);
        setEditData({
            role: admin.role,
            assignedDomains: (admin as any).assignedDomains || []
        });
        setShowEditModal(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isSuperAdmin(user)) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
            <PageHeader title="Admin Management" />

            <div className="mb-8">
                <button
                    onClick={() => {
                        setSearch("");
                        setShowAddModal(true);
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition shadow-lg shadow-blue-500/20"
                >
                    + Add New Admin
                </button>
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 w-full max-w-3xl shadow-2xl">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-800">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    👤
                                </span>
                                Add New Admin
                            </h2>

                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-zinc-800 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleAddAdmin}
                            className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
                        >

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* LEFT SIDE */}
                                <div className="space-y-5">

                                    <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
                                        <h3 className="text-sm font-semibold mb-3 text-zinc-300">
                                            Basic Information
                                        </h3>

                                        <div className="space-y-4">

                                            {/* Name */}
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                className="w-full px-3 py-2 bg-black/50 border border-zinc-800 rounded-lg text-white"
                                                placeholder="Full Name"
                                                required
                                            />

                                            {/* Email */}
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                                className="w-full px-3 py-2 bg-black/50 border border-zinc-800 rounded-lg text-white"
                                                placeholder="Email"
                                                required
                                            />

                                            {/* Password */}
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, password: e.target.value })
                                                }
                                                className="w-full px-3 py-2 bg-black/50 border border-zinc-800 rounded-lg text-white"
                                                placeholder="Password (optional)"
                                            />

                                            {/* Role */}
                                            <select
                                                value={formData.role}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        role: e.target.value,
                                                        assignedDomains: [],
                                                    })
                                                }
                                                className="w-full px-3 py-2 bg-black/50 border border-zinc-800 rounded-lg text-white"
                                            >
                                                {ROLES.map((r) => (
                                                    <option key={r.value} value={r.value}>
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT SIDE */}
                                {formData.role === "domain_lead" ? (
                                    <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">

                                        <h3 className="text-sm font-semibold mb-3 text-blue-400">
                                            Assign Domains ({formData.assignedDomains.length})
                                        </h3>

                                        {/* Search */}
                                        <input
                                            type="text"
                                            placeholder="Search domains..."
                                            className="w-full px-3 py-2 mb-3 text-sm bg-black/50 border border-zinc-800 rounded-lg text-white"
                                            onChange={(e) => setSearch(e.target.value)}
                                            value={search}
                                        />

                                        {/* Domain Chips */}
                                        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                                            {DOMAINS
                                                .filter((d) =>
                                                    d.toLowerCase().includes(search.toLowerCase())
                                                )
                                                .map((domain) => {
                                                    const selected =
                                                        formData.assignedDomains.includes(domain);

                                                    return (
                                                        <button
                                                            key={domain}
                                                            type="button"
                                                            onClick={() => toggleDomain(domain)}
                                                            className={`px-3 py-2 rounded-lg text-sm border transition
                          ${selected
                                                                    ? "bg-blue-500 text-white border-blue-500"
                                                                    : "bg-black/40 text-zinc-400 border-zinc-700 hover:border-blue-500 hover:text-white"
                                                                }`}
                                                        >
                                                            {domain}
                                                        </button>
                                                    );
                                                })}
                                        </div>

                                        {/* Selected Preview */}
                                        {formData.assignedDomains.length > 0 && (
                                            <div className="mt-4 text-xs text-zinc-400">
                                                Selected: {formData.assignedDomains.join(", ")}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-black/30 rounded-xl p-6 border border-zinc-800 flex items-center justify-center text-center text-zinc-500">
                                        <div>
                                            <p className="text-sm font-medium">
                                                No domain selection needed
                                            </p>
                                            <p className="text-xs mt-1">
                                                This role has access to all domains
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 pt-4 border-t border-zinc-800 sticky bottom-0 bg-[#18181B]">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                                >
                                    {submitting ? "Creating..." : "Create Admin"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Edit Admin Role Modal */}
            {showEditModal && selectedAdmin && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#18181B] border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-6">Edit Admin: {selectedAdmin.name}</h2>

                        <form onSubmit={handleUpdateRole} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-zinc-400">System Role</label>
                                <select
                                    value={editData.role}
                                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                >
                                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>

                            {(editData.role === "domain_lead") && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-blue-400">Assigned Domains ({editData.assignedDomains.length})</label>
                                    
                                    {/* Edit Modal Search */}
                                    <input
                                        type="text"
                                        placeholder="Search domains..."
                                        className="w-full px-3 py-2 text-sm bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                        onChange={(e) => setSearch(e.target.value)}
                                        value={search}
                                    />

                                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 bg-black/50 rounded-xl border border-zinc-800">
                                        {DOMAINS
                                            .filter(d => d.toLowerCase().includes(search.toLowerCase()))
                                            .map(domain => (
                                                <label key={domain} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={editData.assignedDomains.includes(domain)}
                                                        onChange={() => toggleDomain(domain, true)}
                                                        className="w-4 h-4 rounded border-zinc-700 bg-black text-blue-500"
                                                    />
                                                    <span className="text-sm text-zinc-300">{domain}</span>
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition"
                                >
                                    {submitting ? "Saving..." : "Update Permissions"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition"
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Generated Password Display */}
            {generatedPassword && (
                <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">New Account Password</p>
                            <p className="font-mono text-2xl text-white selection:bg-blue-500">{generatedPassword}</p>
                            <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                Shared securely. This notice will disappear shortly.
                            </p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(generatedPassword)}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition shadow-lg shadow-blue-500/20"
                        >
                            Copy Password
                        </button>
                    </div>
                </div>
            )}

            {/* Admins Table */}
            <div className="bg-[#18181B] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
                {loading ? (
                    <div className="flex justify-center items-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Admin Profile</th>
                                    <th className="px-6 py-4 font-semibold">System Role</th>
                                    <th className="px-6 py-4 font-semibold">Access Level</th>
                                    <th className="px-6 py-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {admins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{admin.name}</div>
                                            <div className="text-xs text-zinc-500">{admin.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${admin.role === "super_admin" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                                admin.role === "super_domain_admin" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                    "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                }`}>
                                                {admin.role.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {((admin as any).assignedDomains?.length > 0) ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {(admin as any).assignedDomains.map((d: string) => (
                                                        <span key={d} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[10px]">{d}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-600 italic">Full Access</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(admin)}
                                                    className="p-2 bg-zinc-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg transition-all"
                                                    title="Edit Access"
                                                >
                                                    ⚙️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAdmin(admin._id)}
                                                    className="p-2 bg-zinc-800 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-all"
                                                    title="Remove Admin"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
