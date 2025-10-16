"use client";

import { RoleBasedAuth } from "./RoleBasedAuth";
import { motion } from "framer-motion";

interface AdminPageWrapperProps {
  children: React.ReactNode;
}

export function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  return (
    <RoleBasedAuth>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="admin-theme"
      >
        {children}
      </motion.div>
    </RoleBasedAuth>
  );
}

