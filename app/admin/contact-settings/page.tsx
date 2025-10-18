"use client";

import { RoleBasedAuth } from "@/components/RoleBasedAuth";
import ContactSettingsPanel from "@/components/admin/ContactSettingsPanel";

export default function ContactSettingsPage() {
  return (
    <RoleBasedAuth embedded>
      <ContactSettingsPanel />
    </RoleBasedAuth>
  );
}
