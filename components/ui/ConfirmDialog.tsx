"use client";

import React from "react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Delete",
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    confirmButtonClass = "bg-red-600 hover:bg-red-700",
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 bg-[#18181B] rounded-[15px] shadow-2xl border border-zinc-800 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className=" flex items-center justify-center p-6  border-zinc-800">
                    <div className="flex  items-center justify-center w-20 h-20 rounded-full bg-red-500/10">
                        <svg
                            className="w-6 h-6 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>
                    <h3 className=" text-center text-2xl uppercase font-semibold text-white">{title}</h3>

                {/* Content */}
                <div className="p-6 text-center">
                    <p className="text-gray-300 leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-zinc-800 bg-zinc-900/50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors duration-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${confirmButtonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
